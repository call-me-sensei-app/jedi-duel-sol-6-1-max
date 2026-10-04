import * as THREE from 'three';
import {solveLimb} from './biomechanics.js';
const UP=new THREE.Vector3(0,1,0);
const boneGeo=new THREE.CylinderGeometry(1,1,1,10);
const jointGeo=new THREE.SphereGeometry(1,12,10);
function mesh(g,m,parent){const o=new THREE.Mesh(g,m);parent.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
export class Fighter {
  constructor(scene,side){
    this.side=side;this.color=new THREE.Color(side===0?'#53dafa':'#ff4025');
    this.root=new THREE.Group();scene.add(this.root);this.body=new THREE.Group();this.body.position.y=1.14;this.root.add(this.body);
    this.metal=new THREE.MeshPhysicalMaterial({color:side===0?'#8b989b':'#353239',metalness:.78,roughness:.38,clearcoat:.45,clearcoatRoughness:.3});
    this.jointMat=new THREE.MeshStandardMaterial({color:side===0?'#39494e':'#231d24',metalness:.72,roughness:.3});
    this.accent=new THREE.MeshStandardMaterial({color:this.color,emissive:this.color,emissiveIntensity:.65,metalness:.5,roughness:.3});
    this.bones=Array.from({length:11},()=>mesh(boneGeo,this.metal,this.body));
    this.joints=Array.from({length:10},()=>mesh(jointGeo,this.jointMat,this.body));
    this.head=mesh(new THREE.SphereGeometry(.19,24,20),this.metal,this.body);
    this.face=mesh(new THREE.TorusGeometry(.156,.013,6,28,.75*Math.PI),this.accent,this.body);this.face.rotation.z=.125*Math.PI;
    this.saber=new THREE.Group();this.body.add(this.saber);
    const hiltMat=new THREE.MeshStandardMaterial({color:'#bfc3c0',metalness:1,roughness:.22});
    const gripMat=new THREE.MeshStandardMaterial({color:'#181c1d',metalness:.64,roughness:.46});
    const hilt=mesh(new THREE.CylinderGeometry(.045,.055,.29,16),hiltMat,this.saber);hilt.position.y=-.045;
    for(let i=0;i<7;i++){const ring=mesh(new THREE.TorusGeometry(.053,.007,5,16),i%2?gripMat:hiltMat,this.saber);ring.rotation.x=Math.PI/2;ring.position.y=-.15+i*.034;}
    const emitter=mesh(new THREE.CylinderGeometry(.065,.055,.07,16),hiltMat,this.saber);emitter.position.y=.115;
    const switchLight=mesh(new THREE.SphereGeometry(.011,8,6),this.accent,this.saber);switchLight.position.set(0,-.01,.053);
    this.blade=new THREE.Group();this.blade.name='front-blade';this.blade.position.y=.15;this.saber.add(this.blade);
    const outerMat=new THREE.MeshBasicMaterial({color:this.color,transparent:true,opacity:.23,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const innerMat=new THREE.MeshBasicMaterial({color:new THREE.Color(8,8,8),toneMapped:false});
    const coronaMat=new THREE.MeshBasicMaterial({color:this.color.clone().multiplyScalar(side===1?18:9),toneMapped:false,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});
    for(const [r,mat] of [[.057,outerMat],[.024,coronaMat],[.010,innerMat]]){const b=mesh(new THREE.CapsuleGeometry(r,1.2,6,12),mat,this.blade);b.position.y=.62;b.castShadow=false;}
    this.light=new THREE.PointLight(this.color,30,5,2);this.light.name='front-saber-light';this.light.position.y=.67;this.blade.add(this.light);
    this.base=new THREE.Vector3();this.tip=new THREE.Vector3();this.wrist=new THREE.Vector3();
    if(side===1){
      const extension=mesh(new THREE.CylinderGeometry(.052,.052,.20,16),hiltMat,this.saber);extension.name='staff-coupling';extension.position.y=-.26;
      this.rearBlade=new THREE.Group();this.rearBlade.name='rear-blade';this.rearBlade.position.y=-.36;this.rearBlade.rotation.z=Math.PI;this.saber.add(this.rearBlade);
      for(const [r,mat] of [[.052,outerMat],[.024,coronaMat],[.010,innerMat]]){const b=mesh(new THREE.CapsuleGeometry(r,1.06,6,12),mat,this.rearBlade);b.position.y=.55;b.castShadow=false;}
      this.rearLight=new THREE.PointLight(this.color,2.5,4,2);this.rearLight.position.y=.7;this.rearBlade.add(this.rearLight);this.rearBase=new THREE.Vector3();this.rearTip=new THREE.Vector3();
    }
    this.metal.clearcoat=1;this.metal.clearcoatRoughness=.12;
    this.offhandBase=new THREE.Vector3();this.offhandTip=new THREE.Vector3();
    if(side===1)this.equipOffhand(this.saber);
    this.drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.0016,6,4),new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:0,roughness:.035,transmission:.88,thickness:.0015,ior:1.333,transparent:true,opacity:1}),36);this.drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.body.add(this.drops);this.dropDummy=new THREE.Object3D();this.waterGravity=new THREE.Vector3();this.waterRotation=new THREE.Quaternion();
    this.metal.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWetPosition;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWetPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWetPosition;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat runnel=pow(abs(sin(vWetPosition.x*173.0+sin(vWetPosition.z*117.0)*.7)),18.0);roughnessFactor*=mix(.91,1.08,runnel);');};
  }
  equipOffhand(template){this.offhandSaber=template.clone(true);this.offhandSaber.name='offhand-saber';this.offhandSaber.visible=false;const rear=this.offhandSaber.getObjectByName('rear-blade');if(rear)rear.removeFromParent();const coupling=this.offhandSaber.getObjectByName('staff-coupling');if(coupling)coupling.removeFromParent();this.body.add(this.offhandSaber);}
  recoil(t,power,direction){this.recoilAt=t;this.recoilPower=Math.min(.32,.19*power)*direction;}
  update(p,contact,lock,t){
    this.root.position.set(p.x,p.y,p.z);this.root.rotation.y=p.yaw+p.hipTurn;this.body.rotation.set(p.y>.035?p.flip:0,0,0);
    const P=(x,y,z)=>new THREE.Vector3(x,y-1.14,z);
    const hipY=p.afterFight?1.09:1.02-p.crouch,headY=2.08-p.crouch,shoulderY=1.68-p.crouch;
    const hips=[P(-.12,hipY,0),P(.12,hipY,0)];
    this.root.updateMatrixWorld(true);
    const footTargets=p.feet?p.feet.map(f=>this.body.worldToLocal(new THREE.Vector3(...f))):[P(-.25,.36,.05),P(.25,.35,-.16)];
    const legs=hips.map((h,i)=>solveLimb(h,footTargets[i],P(i===0?-.22:.22,.62,.75),.53,.53,8,145));
    const knees=legs.map(l=>l.joint),feet=legs.map(l=>l.end);
    const thorax=v=>{const y=v.y;v.y=0;v.applyAxisAngle(UP,p.torsoTwist);v.y=y;return v;};
    const shoulder=[thorax(P(-.26,shoulderY,p.lean)),thorax(P(.26,shoulderY,p.lean))],rightHand=thorax(P(...p.hand));
    // Both hands share the hilt. Constrain the grip to the intersection of both arm reach spheres.
    if(p.twoHand)for(let n=0;n<10;n++)for(const s of shoulder){const d=rightHand.clone().sub(s),length=d.length();if(length>.67)rightHand.copy(s).addScaledVector(d.normalize(),.67);else if(length<.37){if(length<1e-6)d.set(0,0,1);rightHand.copy(s).addScaledVector(d.normalize(),.37);}}
    const rightArm=solveLimb(shoulder[1],rightHand,thorax(P(.75,1.35,-.10)),.405,.39,10,145);
    const target=this.body.worldToLocal(new THREE.Vector3(...contact));
    const aim=target.sub(rightArm.end).normalize();
    aim.applyAxisAngle(p.attackPlane==='horizontal'?UP:new THREE.Vector3(1,0,0),(lock?.018:p.attackAngle)*(this.side?1:-1));
    if(p.rearStrike)aim.negate();
    if(p.staffSpin){const a=p.staffSpin.phase;aim.set(Math.cos(a),p.staffSpin.stage===1?.08:Math.sin(a)*.72,p.staffSpin.stage===1?Math.sin(a):.2).normalize();}
    if(p.activeBlade==='offhand')aim.set(.25,.75,-.40).normalize();
    if(p.saberAim)aim.set(...p.saberAim).normalize();
    const recoilAge=t-(this.recoilAt??-100),recoilAngle=recoilAge>=0&&recoilAge<.3?this.recoilPower*Math.exp(-recoilAge*13)*Math.sin(recoilAge*43):0;aim.applyAxisAngle(new THREE.Vector3(0,0,1),recoilAngle);
    if(p.chapter===0&&t<1.5||p.chapter===5&&t%48>44)aim.set(this.side?-.55:.38,.8,.28).normalize();
    const leftGrip=p.twoHand?rightArm.end.clone().addScaledVector(aim,-.12):thorax(P(...p.offhand));
    const leftArm=solveLimb(shoulder[0],leftGrip,thorax(P(-.75,1.35,-.10)),.405,.39,10,145);
    const arms=[leftArm,rightArm];
    const elbows=arms.map(a=>a.joint),wrists=arms.map(a=>a.end);
    this.anatomy={armFlex:arms.map(a=>a.flexDegrees),kneeFlex:legs.map(l=>l.flexDegrees),armLengths:arms.map((a,i)=>[shoulder[i].distanceTo(a.joint),a.joint.distanceTo(a.end)]),legLengths:legs.map((l,i)=>[hips[i].distanceTo(l.joint),l.joint.distanceTo(l.end)]),footWorld:feet.map(f=>this.body.localToWorld(f.clone()).toArray()),gripError:p.twoHand?leftArm.end.distanceTo(leftGrip):0,torsoTwist:p.torsoTwist,hipTurn:p.hipTurn};
    const segments=[[P(0,hipY,0),P(0,shoulderY+.05,p.lean),.085],[shoulder[0],shoulder[1],.061],[P(0,shoulderY+.05,p.lean),P(0,headY-.19,p.lean+.02),.053],...hips.flatMap((h,i)=>[[h,knees[i],.064],[knees[i],feet[i],.055]]),...shoulder.flatMap((s,i)=>[[s,elbows[i],.054],[elbows[i],wrists[i],.046]])];
    segments.forEach(([a,b,r],i)=>{const o=this.bones[i],dir=b.clone().sub(a);o.position.copy(a).addScaledVector(dir,.5);o.scale.set(r,dir.length(),r);o.quaternion.setFromUnitVectors(UP,dir.normalize());});
    const joints=[...hips,...knees,...feet,...elbows,...wrists];joints.forEach((v,i)=>{this.joints[i].position.copy(v);this.joints[i].scale.setScalar(i<2?.097:i>7?.066:.076);});
    this.head.position.copy(thorax(P(0,headY,p.lean+.02)));this.face.position.copy(thorax(P(0,headY,p.lean+.15)));this.face.rotation.y=-p.torsoTwist-p.hipTurn;
    this.body.getWorldQuaternion(this.waterRotation);this.waterGravity.set(0,-1,0).applyQuaternion(this.waterRotation.invert());
    for(let i=0;i<36;i++){const a=i*2.3999,age=(t*(.31+(i%5)*.037)+i*.137)%1;if(i<18){const y=.25+(i%7)*.08,r=Math.sqrt(1-y*y),normal=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).addScaledVector(this.waterGravity,age*age*.72).normalize();this.dropDummy.position.copy(this.head.position).addScaledVector(normal,.1917);}else{this.dropDummy.position.copy(P(Math.cos(a)*.0867,hipY+.6*(1-age*age),p.lean*(1-age*age)+Math.sin(a)*.0867));}const size=.70+(i%5)*.12;this.dropDummy.scale.set(size,size*(1+age*.22),size);this.dropDummy.updateMatrix();this.drops.setMatrixAt(i,this.dropDummy.matrix);}this.drops.instanceMatrix.needsUpdate=true;
    this.saber.position.copy(wrists[1]);
    this.root.updateMatrixWorld(true);
    this.saber.quaternion.setFromUnitVectors(UP,aim);this.blade.scale.y=Math.max(.001,p.ignite);this.light.intensity=5.5*p.ignite;
    if(this.rearBlade){const staff=p.weaponMode==='staff';this.rearBlade.visible=staff;this.rearLight.intensity=staff?2.5:0;this.saber.getObjectByName('staff-coupling').visible=staff;}
    if(this.offhandSaber){this.offhandSaber.visible=p.weaponMode==='dual'||p.weaponMode==='captured-dual';this.offhandSaber.position.copy(wrists[0]);const leftAim=this.body.worldToLocal(new THREE.Vector3(...contact)).sub(wrists[0]).normalize();leftAim.applyAxisAngle(UP,-p.attackAngle*(p.activeBlade==='offhand'?1.15:.8));if(p.activeBlade==='primary')leftAim.set(-.65,.35,.10).normalize();if(p.offhandAim)leftAim.set(...p.offhandAim).normalize();if(p.afterFight)leftAim.set(-.15,-.45,.90).normalize();leftAim.applyAxisAngle(new THREE.Vector3(0,0,1),-recoilAngle*.8);this.offhandSaber.quaternion.setFromUnitVectors(UP,leftAim);}
    this.root.updateMatrixWorld(true);this.blade.localToWorld(this.base.set(0,0,0));this.blade.localToWorld(this.tip.set(0,1.25,0));
    if(this.rearBlade){this.rearBlade.scale.y=Math.max(.001,p.ignite);this.root.updateMatrixWorld(true);this.rearBlade.localToWorld(this.rearBase.set(0,0,0));this.rearBlade.localToWorld(this.rearTip.set(0,1.12,0));}
    if(this.offhandSaber){const b=this.offhandSaber.getObjectByName('front-blade');b.localToWorld(this.offhandBase.set(0,0,0));b.localToWorld(this.offhandTip.set(0,1.25,0));}
    this.body.localToWorld(this.wrist.copy(wrists[1]));
  }
}
