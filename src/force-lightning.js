import * as THREE from 'three';
export const FORCE_CUES=Object.freeze([{start:40.55,end:41.42,kind:'volley'},{start:86.40,end:88.42,kind:'pillar'}]);
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
export function forceStateAt(t){const cue=FORCE_CUES.find(c=>t>=c.start&&t<c.end);if(!cue)return{active:false,intensity:0,cast:0,kind:''};const envelope=smooth((t-cue.start)/.14)*smooth((cue.end-t)/.13),flicker=.78+.22*Math.pow(Math.sin(t*71),2);return{...cue,active:true,cast:envelope,intensity:envelope*flicker};}
/** Deterministic forks anchored to the casting hand and the defended blade / lifted stone. */
export function lightningPaths(from,to,t){
  const delta=to.clone().sub(from),length=delta.length(),direction=delta.clone().normalize(),up=Math.abs(direction.y)<.92?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0),side=new THREE.Vector3().crossVectors(direction,up).normalize(),normal=new THREE.Vector3().crossVectors(side,direction).normalize(),tick=Math.floor(t*34),paths=[];
  const jitter=(u,k,axis)=>Math.sin(u*157.2+tick*1.73+k*13.41+axis*5.73)*Math.sin(u*Math.PI)*Math.min(.30,length*.045);
  for(let k=0;k<3;k++){const path=[];for(let j=0;j<=22;j++){const u=j/22;path.push(from.clone().addScaledVector(delta,u).addScaledVector(side,jitter(u,k,0)).addScaledVector(normal,jitter(u,k,1)));}paths.push(path);}
  for(let k=0;k<5;k++){const origin=paths[k%3][5+k*3],end=origin.clone().addScaledVector(side,(k%2?1:-1)*(.25+length*.055)).addScaledVector(normal,(k%3-1)*.36);paths.push(Array.from({length:6},(_,j)=>origin.clone().lerp(end,j/5).addScaledVector(normal,Math.sin(j*9.1+tick+k)*.08*Math.sin(j/5*Math.PI))));}
  return paths;
}
export class ForceLightning{
  constructor(scene){
    const geometry=new THREE.CylinderGeometry(1,1,1,6),core=new THREE.MeshBasicMaterial({color:new THREE.Color(4,5,8),toneMapped:false}),halo=new THREE.MeshBasicMaterial({color:new THREE.Color(.7,.25,4.5),transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    this.core=new THREE.InstancedMesh(geometry,core,110);this.halo=new THREE.InstancedMesh(geometry,halo,110);for(const m of [this.core,this.halo]){m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.visible=false;scene.add(m);}
    this.lights=[0,1,2].map(()=>{const light=new THREE.PointLight('#aba4ff',0,6,2);scene.add(light);return light;});
    this.crown=new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(2.5,3,5),toneMapped:false,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(this.crown);
    this.steam=new THREE.InstancedMesh(new THREE.SphereGeometry(.008,5,4),new THREE.MeshBasicMaterial({color:new THREE.Color(1.1,1.3,2),toneMapped:false,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}),32);scene.add(this.steam);this.dummy=new THREE.Object3D();this.up=new THREE.Vector3(0,1,0);this.origin=new THREE.Vector3();this.endpoint=new THREE.Vector3();
  }
  update(t,fighters,pillar){
    const state=forceStateAt(t);for(const m of [this.core,this.halo,this.steam,this.crown])m.visible=state.active;this.lights.forEach(l=>l.intensity=0);this.state=state;this.segmentCount=0;if(!state.active)return state;
    const from=fighters[1].joints[8].getWorldPosition(new THREE.Vector3()),to=state.kind==='pillar'?pillar.whole.getWorldPosition(new THREE.Vector3()):fighters[0].base.clone().lerp(fighters[0].tip,.53);this.origin.copy(from);this.endpoint.copy(to);
    const paths=lightningPaths(from,to,t);let index=0;
    for(const path of paths)for(let j=1;j<path.length;j++){const a=path[j-1],b=path[j],delta=b.clone().sub(a);this.dummy.position.copy(a).add(b).multiplyScalar(.5);this.dummy.quaternion.setFromUnitVectors(this.up,delta.clone().normalize());for(const [m,r]of [[this.core,.005],[this.halo,.027]]){this.dummy.scale.set(r,delta.length(),r);this.dummy.updateMatrix();m.setMatrixAt(index,this.dummy.matrix);}index++;}
    for(const m of [this.core,this.halo]){m.count=index;m.instanceMatrix.needsUpdate=true;}this.segmentCount=index;
    this.crown.position.copy(from);this.crown.scale.setScalar(.7+state.intensity*.65);this.crown.material.opacity=state.intensity*.7;
    this.lights.forEach((l,i)=>{l.position.copy(from).lerp(to,i*.5);l.intensity=state.intensity*(i===2?12:6);});
    for(let i=0;i<32;i++){const age=(t*3.3+i*.117)%1,a=i*2.3999;this.dummy.position.copy(to).add(new THREE.Vector3(Math.cos(a)*age*.40,age*.75,Math.sin(a)*age*.40));this.dummy.scale.setScalar((1-age)*(.45+state.intensity));this.dummy.quaternion.identity();this.dummy.updateMatrix();this.steam.setMatrixAt(i,this.dummy.matrix);}this.steam.instanceMatrix.needsUpdate=true;
    return state;
  }
}
