import * as THREE from 'three';import {smooth,lerp,BEAT} from './choreography.js';
import {StoneRain,wetStoneMaterial} from './wet-stone.js';
export const PILLAR={lift:86.4,throw:88.20,cut:250*BEAT,flyEnd:90.60,end:92.0};
export function pillarPosition(t){const start=[4.6,.78,-6.8],hover=[2.75,2.75,-.3],cut=[-1.55,1.70,.35];if(t<PILLAR.throw){const e=smooth((t-PILLAR.lift)/(PILLAR.throw-PILLAR.lift));return start.map((v,i)=>lerp(v,hover[i],e));}const u=smooth((t-PILLAR.throw)/(PILLAR.cut-PILLAR.throw));return hover.map((v,i)=>lerp(v,cut[i],u));}
export class PillarSetPiece{
  constructor(scene,stone,fx,audio){
    this.fx=fx;this.audio=audio;this.last=-1;
    stone=wetStoneMaterial(stone);
    this.whole=new THREE.Group();scene.add(this.whole);
    const geo=new THREE.BoxGeometry(1.45,2.45,1.45,4,5,4);const a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);if(y>.9)a.setY(i,y-.13-.11*Math.sin(x*15+z*7));}geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,stone);m.castShadow=m.receiveShadow=true;this.whole.add(m);
    const groove=new THREE.MeshStandardMaterial({color:'#3e4945',metalness:.01,roughness:.84});for(const y of [-.90,-.45,0,.45,.90]){const band=new THREE.Mesh(new THREE.BoxGeometry(1.51,.04,1.51),groove);band.position.y=y;this.whole.add(band);}
    this.halves=[0,1].map(i=>{const g=new THREE.Group(),part=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.225,1.45,4,2,4),stone);part.castShadow=part.receiveShadow=true;g.add(part);for(const y of [-.45,0,.45]){const band=new THREE.Mesh(new THREE.BoxGeometry(1.51,.04,1.51),groove);band.position.y=y;g.add(band);}scene.add(g);return g;});
    this.forceLight=new THREE.PointLight('#ff3d24',0,4,2);scene.add(this.forceLight);
    const grit=new THREE.BufferGeometry(),positions=new Float32Array(120*3);grit.setAttribute('position',new THREE.BufferAttribute(positions,3));this.dust=new THREE.Points(grit,new THREE.PointsMaterial({color:'#aca99a',size:.035,transparent:true,opacity:0,depthWrite:false}));this.dust.frustumCulled=false;scene.add(this.dust);
    this.positions=positions;
    this.rain=new StoneRain(scene,[{object:this.whole,half:[.725,1.225,.725]},...this.halves.map(object=>({object,half:[.725,.6125,.725]}))]);
  }
  update(t,moving){
    const p=new THREE.Vector3(...pillarPosition(t)),u=Math.max(0,(t-PILLAR.cut));this.whole.visible=t<PILLAR.cut;this.whole.position.copy(p);this.whole.rotation.set(t<PILLAR.lift?.3:(t-PILLAR.lift)*1.7,0,t<PILLAR.lift?-.6:(t-PILLAR.lift)*.5);
    this.forceLight.position.copy(p);this.forceLight.intensity=t>=PILLAR.lift&&t<PILLAR.throw?7:0;
    this.halves.forEach((g,i)=>{g.visible=t>=PILLAR.cut;const dt=Math.min(u,.95),sign=i?1:-1;g.position.set(-1.55+dt*1.0,Math.max(.56,1.7+sign*.62+dt*1.6-4.9*dt*dt),.35+sign*dt*6.2);g.rotation.set(dt*(i?3.6:-3.1),dt*1.5,dt*2.0);});
    this.dust.material.opacity=u<1.1&&t>=PILLAR.cut?(1-u/1.1)*.4:0;for(let i=0;i<120;i++){const a=i*2.3999,v=1+(i%13)*.17;this.positions.set([-1.55+Math.cos(a)*v*u,1.7+Math.sin(a*2.1)*v*u-u*u*2,.35+Math.sin(a)*v*u],i*3);}this.dust.geometry.attributes.position.needsUpdate=true;
    if(moving&&this.last<PILLAR.cut&&t>=PILLAR.cut){this.fx.contact(new THREE.Vector3(-1.55,1.7,.35),t,1.8);this.audio.clash(1.8,true);this.audio.landing(1.2);}
    this.last=t;
    this.rain.update(t);
    return{active:t>=PILLAR.lift&&t<PILLAR.end,phase:t<PILLAR.throw?'force':t<PILLAR.cut?'chase':'burst',position:p};
  }
}
