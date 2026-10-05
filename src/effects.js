import * as THREE from 'three';
export function weaponTrailSources(fighters){const [light,dark]=fighters;return[
  {base:light.base,tip:light.tip,enabled:light.saber.visible&&light.blade.scale.y>.05},
  {base:dark.base,tip:dark.tip,enabled:dark.saber.visible&&dark.blade.scale.y>.05},
  {base:dark.rearBase,tip:dark.rearTip,enabled:dark.saber.visible&&Boolean(dark.rearBlade?.visible)},
  {base:light.offhandBase,tip:light.offhandTip,enabled:Boolean(light.offhandSaber?.visible)},
  {base:dark.offhandBase,tip:dark.offhandTip,enabled:Boolean(dark.offhandSaber?.visible)},
];}
export class DuelEffects{
  constructor(scene){
    this.scene=scene;this.age=10;this.hitPoint=new THREE.Vector3();this.shake=0;this.lastHitTime=-10;this.hitCount=0;
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff');g.addColorStop(.08,'#fffadc');g.addColorStop(.22,'#ffca68bb');g.addColorStop(.5,'#ff8a2222');g.addColorStop(1,'#ff660000');x.fillStyle=g;x.fillRect(0,0,128,128);
    this.flash=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color:new THREE.Color(4,3.3,2),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));scene.add(this.flash);
    this.light=new THREE.PointLight('#ffdb9b',0,7,2);scene.add(this.light);
    this.particles=new THREE.InstancedMesh(new THREE.SphereGeometry(.012,5,4),new THREE.MeshBasicMaterial({color:new THREE.Color(6,3.5,1.2),toneMapped:false}),64);this.particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.particles.frustumCulled=false;scene.add(this.particles);this.dummy=new THREE.Object3D();
    this.sparks=Array.from({length:64},(_,i)=>{const a=i*2.3999,z=(i%11)/5-1,r=Math.sqrt(Math.max(0,1-z*z)),v=1.5+(i%9)*.48;return new THREE.Vector3(Math.cos(a)*r*v,Math.abs(z)*v+.5,Math.sin(a)*r*v);});
    this.ring=new THREE.Mesh(new THREE.TorusGeometry(.17,.008,5,48),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2,.8),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));scene.add(this.ring);
    this.trails=[0,1,1,1,1,1].map(side=>{const geometry=new THREE.BufferGeometry(),p=new Float32Array(22*6*3),a=new Float32Array(22*6);geometry.setAttribute('position',new THREE.BufferAttribute(p,3));geometry.setAttribute('fade',new THREE.BufferAttribute(a,1));const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{color:{value:new THREE.Color(side?'#ff4b29':'#36bfe6').multiplyScalar(2.4)}},vertexShader:'attribute float fade;varying float vFade;void main(){vFade=fade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying float vFade;uniform vec3 color;void main(){gl_FragColor=vec4(color,vFade*.19);}'});const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);return{mesh,geometry,p,a,history:[]};});
  }
  contact(point,time,power=1){if(time-this.lastHitTime<.070&&time>=this.lastHitTime)return false;this.lastHitTime=time;this.hitPoint.copy(point);this.age=0;this.power=power;this.hitCount++;this.shake=.085*power;return true;}
  clear(){this.trails.forEach(t=>t.history=[]);this.age=10;this.lastHitTime=-10;}
  update(dt,time,fighters,camera,moving){
    this.age+=dt;const life=Math.exp(-this.age*24)*this.power||0;this.light.position.copy(this.hitPoint);this.light.intensity=9*life;this.flash.position.copy(this.hitPoint);this.flash.scale.setScalar(.65+this.age*2.8);this.flash.material.opacity=life*.65;
    this.ring.position.copy(this.hitPoint);this.ring.quaternion.copy(camera.quaternion);this.ring.scale.setScalar(1+this.age*10);this.ring.material.opacity=Math.max(0,1-this.age/.17)*.55;
    for(let i=0;i<64;i++){const age=this.age,alive=age<.30+(i%7)*.025;this.dummy.position.copy(this.hitPoint).addScaledVector(this.sparks[i],age);this.dummy.position.y-=4.9*age*age;this.dummy.scale.set(alive?.6:0,alive?2.5:0,alive?.6:0);this.dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),this.sparks[i].clone().normalize());this.dummy.updateMatrix();this.particles.setMatrixAt(i,this.dummy.matrix);}this.particles.instanceMatrix.needsUpdate=true;
    const sources=weaponTrailSources(fighters),flying=this.flyingWeapon,blade=flying?.getObjectByName('front-blade');sources.push({base:blade?blade.localToWorld(new THREE.Vector3(0,0,0)):new THREE.Vector3(),tip:blade?blade.localToWorld(new THREE.Vector3(0,1.25,0)):new THREE.Vector3(),enabled:Boolean(flying?.visible)});this.trails.forEach((trail,i)=>{const{base,tip,enabled}=sources[i];trail.mesh.visible=enabled;if(!enabled){trail.history=[];return;}if(moving){trail.history.unshift({base:base.clone(),tip:tip.clone(),time});while(trail.history.length>23||trail.history.at(-1)&&time-trail.history.at(-1).time>.105)trail.history.pop();}let n=0;for(let j=0;j<22;j++){const a=trail.history[j],b=trail.history[j+1];for(const v of a&&b?[a.base,a.tip,b.tip,a.base,b.tip,b.base]:Array(6).fill(base)){trail.p.set(v.toArray(),n*3);trail.a[n]=(a&&b?1-j/22:0)*Math.max(0,1-(time-(a?.time??time))/.12);n++;}}trail.geometry.attributes.position.needsUpdate=true;trail.geometry.attributes.fade.needsUpdate=true;});
    this.shake*=Math.exp(-dt*24);if(moving&&this.shake>.0001){camera.position.x+=Math.sin(time*123)*this.shake;camera.position.y+=Math.cos(time*151)*this.shake*.7;}
  }
}
