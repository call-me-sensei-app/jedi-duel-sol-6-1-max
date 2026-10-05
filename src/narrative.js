import {FINAL_CUTS} from './story-times.js';
import * as THREE from 'three';import {Fighter} from './figure.js';import {duelState,BEAT,smooth} from './choreography.js';
import {bouncingToss} from './dynamics.js';
import {TRANSFER,ASSAULT,flyingSaberPosition,transferPhase} from './weapon-transfer.js';
export const STORY={split:324*BEAT,disarm:TRANSFER.launch,catch:TRANSFER.catch,cuts:FINAL_CUTS,toss:155.65,extinguish:158.10,holster:158.80,end:165};
/** Seek-safe prop and defeat animation: no gore, only the metallic stick figure parts. */
export class Narrative{
  constructor(scene,fighters,fx,audio){
    this.fighters=fighters;this.fx=fx;this.audio=audio;this.last=-1;this.events=new Set();
    const probeScene=new THREE.Scene(),probes=[new Fighter(probeScene,0),new Fighter(probeScene,1)];probes[0].equipOffhand(probes[1].saber);
    const pose=t=>{const s=duelState(t);probes.forEach((f,i)=>f.update(s.fighters[i],s.contact,s.lock,t));return s;};
    pose(STORY.disarm-.00001);const disarm=probes[1].offhandSaber;this.flySword=disarm.clone(true);this.flySword.visible=false;scene.add(this.flySword);this.throwFrom=disarm.getWorldPosition(new THREE.Vector3());this.launchRotation=disarm.getWorldQuaternion(new THREE.Quaternion());this.flightPosition=this.throwFrom.clone();this.spinAxis=new THREE.Vector3(.15,.10,1).normalize();fx.flyingWeapon=this.flySword;
    pose(STORY.catch+.00001);this.catchAt=probes[0].offhandSaber.getWorldPosition(new THREE.Vector3());this.catchRotation=probes[0].offhandSaber.getWorldQuaternion(new THREE.Quaternion());
    pose(STORY.toss);this.tossSword=probes[0].offhandSaber.clone(true);this.tossFrom=probes[0].offhandSaber.getWorldPosition(new THREE.Vector3());this.tossRotation=probes[0].offhandSaber.getWorldQuaternion(new THREE.Quaternion());this.tossSword.visible=false;scene.add(this.tossSword);
    this.parts=STORY.cuts.map((at,index)=>{pose(at);const f=probes[1],nodes=index===0?[f.bones[7],f.bones[8],f.joints[6],f.joints[8]]:index===1?[f.bones[9],f.bones[10],f.joints[7],f.joints[9],f.saber]:[f.head,f.face],group=new THREE.Group(),origin=nodes[0].getWorldPosition(new THREE.Vector3());for(const n of nodes){const c=n.clone(true);n.matrixWorld.decompose(c.position,c.quaternion,c.scale);c.position.sub(origin);group.add(c);}scene.add(group);group.visible=false;return{at,index,group,origin};});
  }
  update(t,moving){
    const dark=this.fighters[1],light=this.fighters[0];
    dark.bones[7].visible=dark.bones[8].visible=dark.joints[6].visible=dark.joints[8].visible=t<STORY.cuts[0];
    dark.bones[9].visible=dark.bones[10].visible=dark.joints[7].visible=dark.joints[9].visible=dark.saber.visible=t<STORY.cuts[1];
    dark.head.visible=dark.face.visible=t<STORY.cuts[2];
    dark.drops.visible=t<STORY.cuts[2];
    if(t<STORY.split)dark.offhandSaber.visible=false;
    if(t>=STORY.disarm)dark.offhandSaber.visible=false;
    if(t>=STORY.toss)light.offhandSaber.visible=false;
    this.tossSword.visible=t>=STORY.toss;
    if(this.tossSword.visible){
      const age=t-STORY.toss,pose=bouncingToss(age,this.tossFrom.toArray());
      const flat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(.84,0,.54).normalize());
      this.tossSword.position.set(...pose.position);
      if(age<.66){
        this.tossSword.quaternion.copy(this.tossRotation).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(.2,.4,1).normalize(),age*5.5));
        this.tossSword.quaternion.slerp(flat,smooth((age-.48)/.18));
      }else{
        const a=age-.66,wobble=Math.sin(a*17)*Math.exp(-a*6);
        this.tossSword.quaternion.copy(flat).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),wobble*.48));
        this.tossSword.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(.54,0,-.84).normalize(),wobble*.08));
        if(moving&&t>this.last&&pose.bounce>1&&pose.bounce>(this.tossBounce||0))this.audio.landing(.45*Math.pow(.35,pose.bounce-1));
      }
      this.tossBounce=pose.bounce;
    }else this.tossBounce=0;
    if(t>=STORY.holster){light.saber.position.set(.17,-.18,-.10);light.saber.rotation.set(.10,0,.30);light.root.updateMatrixWorld(true);}
    const flight=(t-STORY.disarm)/(STORY.catch-STORY.disarm);this.flySword.visible=flight>=0&&flight<1;
    if(this.flySword.visible){this.flightPosition.set(...flyingSaberPosition(t,this.throwFrom.toArray(),this.catchAt.toArray()));this.flySword.position.copy(this.flightPosition);this.flySword.quaternion.copy(this.launchRotation).premultiply(new THREE.Quaternion().setFromAxisAngle(this.spinAxis,flight*Math.PI*6));this.flySword.quaternion.slerp(this.catchRotation,smooth((flight-.80)/.20));this.flySword.updateMatrixWorld(true);}
    const collapse=smooth((t-STORY.cuts[2]-.2)/.85);if(collapse>0){dark.body.rotation.z=-Math.PI/2*collapse;dark.root.position.y=-.92*collapse;dark.root.updateMatrixWorld(true);}
    for(const p of this.parts){const dt=Math.max(0,t-p.at);p.group.visible=t>=p.at;if(p.group.visible){const fall=Math.min(dt,.64);p.group.position.copy(p.origin);p.group.position.x+=(p.index===0?-1.2:p.index===2?2.15:1.15)*Math.min(dt,.8);p.group.position.z+=(p.index===2?1.65:.90)*Math.min(dt,.8);p.group.position.y=Math.max(.10,p.origin.y+.8*fall-4.9*fall*fall);if(dt>.64)p.group.position.y=.10+Math.max(0,Math.sin((dt-.64)*17))*Math.exp(-(dt-.64)*9)*.04;p.group.rotation.set(Math.min(dt,.64)*3.4,Math.min(dt,.64)*2.7,Math.min(dt,.64)*4.5);}}
    for(const [name,at,point]of [['split',STORY.split,new THREE.Vector3(...duelState(STORY.split).contact)],['disarm',STORY.disarm,this.throwFrom],['catch',STORY.catch,this.catchAt],...this.parts.map(p=>['cut'+p.index,p.at,p.origin])]){
      if(moving&&this.last<at&&t>=at&&!this.events.has(name)){this.events.add(name);this.fx.contact(point,t,name.startsWith('cut')?2.1:name==='disarm'?1.5:name==='catch'?.3:.7);if(name==='catch')this.audio.landing?.(.40);else this.audio.clash(name.startsWith('cut')?1.8:name==='disarm'?1.5:.7,name.startsWith('cut'));if(name.startsWith('cut'))this.impactAt=at;}
    }
    if(moving&&this.last<STORY.toss+.66&&t>=STORY.toss+.66)this.audio.landing(.45);
    if(t<this.last-1)this.events.clear();this.last=t;
    const phase=transferPhase(t);
    return t>=159?'PULL OUT / END OF FILM':t>=STORY.extinguish?'THE SENTINEL / SABER EXTINGUISHED':t>=STORY.toss?'CAPTURED SABER / DISCARDED':t>=STORY.cuts[2]?'THE LIGHT REMAINS':t>=ASSAULT.end?'THREE FINAL CUTS':t>=ASSAULT.start?'DUAL-SABER CROSSFIRE / LEFT-RIGHT BARRAGE':phase==='catch'?(t<STORY.catch?'STEP BACK / REACH FOR THE HILT':'RED SABER CAUGHT / DUAL WIELD'):t>=STORY.disarm?'SPINNING RED SABER / UPWARD DISARM':t>=STORY.split?'SPLIT STAFF / DARK DUAL WIELD':'DOUBLE-ENDED STAFF';
  }
}
