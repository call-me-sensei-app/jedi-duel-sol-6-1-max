import * as THREE from 'three';import {BEAT,smooth} from './choreography.js';
import {StoneRain,wetStoneMaterial} from './wet-stone.js';
export const KNOCKBACK={start:65.85,strike:186*BEAT,impact:188*BEAT,end:70.0};
export class KnockbackSetPiece{
  constructor(scene,stone,fx,audio){
    this.fx=fx;this.audio=audio;this.last=-1;this.lastDent=-1;
    stone=wetStoneMaterial(stone);this.geometry=new THREE.BoxGeometry(1.55,6.2,1.55,5,24,5);this.original=new Float32Array(this.geometry.attributes.position.array);this.pillar=new THREE.Mesh(this.geometry,stone);this.pillar.position.set(-6.65,3.1,1.05);this.pillar.castShadow=this.pillar.receiveShadow=true;scene.add(this.pillar);
    this.upperBands=[];const trimMat=new THREE.MeshStandardMaterial({color:'#68706a',roughness:.75,metalness:.1});for(let y=.18;y<6.0;y+=.47){const ring=new THREE.Mesh(new THREE.BoxGeometry(1.64,.045,1.64),trimMat);ring.position.set(-6.65,y,1.05);ring.castShadow=true;scene.add(ring);if(y>2.6)this.upperBands.push({ring,local:new THREE.Vector3(0,y-2.6,0)});}
    const linePoints=[];for(let ray=0;ray<9;ray++){let y=1.6,z=1.05;const angle=ray/9*Math.PI*2;for(let i=0;i<10;i++){const yy=y+Math.sin(angle)*.11+(Math.sin(i*3.4+ray)*.035),zz=z+Math.cos(angle)*.06;const x=-6.04-.23*Math.exp(-Math.pow((y-1.6)/.6,2));linePoints.push(x,y,z,x,yy,zz);y=yy;z=zz;}}this.cracks=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(linePoints,3)),new THREE.LineBasicMaterial({color:'#0e1918'}));this.cracks.visible=false;scene.add(this.cracks);
    this.chips=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.055,0),stone,42);this.chips.castShadow=true;scene.add(this.chips);this.dummy=new THREE.Object3D();
    this.upper=new THREE.Group();this.upper.position.set(-6.65,2.6,1.05);this.upperMesh=new THREE.Mesh(new THREE.BoxGeometry(1.55,3.6,1.55,5,8,5),stone);this.upperMesh.position.y=1.8;this.upperMesh.castShadow=this.upperMesh.receiveShadow=true;this.upper.add(this.upperMesh);scene.add(this.upper);this.upper.visible=false;
    this.bigChips=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.22,1),stone,16);this.bigChips.castShadow=true;scene.add(this.bigChips);
    const dustGeo=new THREE.BufferGeometry();this.dustPositions=new Float32Array(280*3);dustGeo.setAttribute('position',new THREE.BufferAttribute(this.dustPositions,3));const dustMaterial=new THREE.PointsMaterial({color:'#a8aba3',size:.10,transparent:true,opacity:0,depthWrite:false});dustMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat radius=length(gl_PointCoord-.5); diffuseColor.a*=1.-smoothstep(.08,.5,radius);');};this.dust=new THREE.Points(dustGeo,dustMaterial);this.dust.frustumCulled=false;scene.add(this.dust);
    this.rain=new StoneRain(scene,[{object:this.pillar,half:[.775,3.1,.775]},{object:this.upperMesh,half:[.775,1.8,.775]}]);
  }
  update(t,moving,hero){
    const age=t-KNOCKBACK.impact,dent=t>=KNOCKBACK.impact?smooth(age/.22):0;
    if(dent!==this.lastDent){const a=this.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=this.original[i*3],y=this.original[i*3+1],z=this.original[i*3+2],height=y+3.1;const damage=x>.18?Math.exp(-Math.pow((height-1.6)/.48,2))*Math.exp(-z*z/.28)*.42*dent:0;a.setXYZ(i,x-damage,age>=0?Math.min(y,-.5):y,z);}a.needsUpdate=true;this.geometry.computeVertexNormals();this.lastDent=dent;}
    this.cracks.visible=dent>0;
    this.upper.visible=age>=0;const collapse=Math.max(0,Math.min(age,1.6));this.upper.rotation.z=Math.min(1.6,collapse*collapse*.78);this.upper.position.y=2.6-Math.min(.75,collapse*.35);
    for(const b of this.upperBands){b.ring.position.copy(b.local).applyEuler(this.upper.rotation).add(this.upper.position);b.ring.quaternion.copy(this.upper.quaternion);}
    for(let i=0;i<42;i++){const dt=Math.max(0,Math.min(age,.72)),angle=i*2.3999;this.dummy.position.set(-6.05+dt*(1.2+(i%7)*.20),Math.max(.06,1.6+Math.sin(angle)*dt*1.6-dt*dt*4.9),1.05+Math.cos(angle)*dt*1.9);this.dummy.rotation.set(dt*6,dt*4,angle);this.dummy.scale.setScalar(age>=0&&age<1.7?1:0);this.dummy.updateMatrix();this.chips.setMatrixAt(i,this.dummy.matrix);}this.chips.instanceMatrix.needsUpdate=true;
    for(let i=0;i<16;i++){const dt=Math.max(0,Math.min(age,.9)),a=i*2.3999;this.dummy.position.set(-6.15+Math.cos(a)*dt*2,Math.max(.14,2.2+Math.sin(a)*dt*2.2-dt*dt*4.9),1.05+Math.sin(a)*dt*2.1);this.dummy.rotation.set(dt*3+i,dt*5,dt*2);this.dummy.scale.setScalar(age>=0&&age<2.3?.55+(i%4)*.25:0);this.dummy.updateMatrix();this.bigChips.setMatrixAt(i,this.dummy.matrix);}this.bigChips.instanceMatrix.needsUpdate=true;
    this.dust.material.opacity=age>=0&&age<2.3?Math.min(.34,age*3)*(1-age/2.3):0;for(let i=0;i<280;i++){const a=i*2.3999,d=Math.max(0,age);this.dustPositions.set([-6.05+Math.cos(a)*(d+.05)*(1+(i%7)*.11),1.6+Math.sin(a*1.3)*d*.9+.25*d,1.05+Math.sin(a)*(d+.05)*1.3],i*3);}this.dust.geometry.attributes.position.needsUpdate=true;
    if(moving&&this.last<KNOCKBACK.impact&&t>=KNOCKBACK.impact){this.fx.contact(new THREE.Vector3(-6.05,1.6,1.05),t,2.7);this.audio.landing(2);this.audio.clash(2.3,true);}this.last=t;
    this.rain.targets[0].half[1]=age>=0?1.3:3.1;this.rain.targets[0].offset=age>=0?[0,-1.8,0]:[0,0,0];this.rain.update(t);
    return{active:t>=KNOCKBACK.start&&t<KNOCKBACK.end,phase:t<KNOCKBACK.strike?'guard':t<KNOCKBACK.impact?'flight':t<67.82?'wall':t<68.52?'kick':'counter',position:new THREE.Vector3(hero.x,1.3+hero.y,hero.z),dent};
  }
}
