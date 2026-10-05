import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {TRANSFER,ASSAULT,ASSAULT_BEATS,flyingSaberPosition} from '../src/weapon-transfer.js';
import {duelState} from '../src/choreography.js';import {Fighter} from '../src/figure.js';import {Narrative} from '../src/narrative.js';import {bladeContact} from '../src/biomechanics.js';
function rig(){const scene=new THREE.Scene(),fighters=[new Fighter(scene,0),new Fighter(scene,1)];fighters[0].equipOffhand(fighters[1].saber);const story=new Narrative(scene,fighters,{contact(){}},{clash(){},landing(){}});return{fighters,story,seek(t){const state=duelState(t);fighters.forEach((f,i)=>f.update(state.fighters[i],state.contact,state.lock,t));story.update(t,false);return state;}};}
test('an upward blade contact precedes the visible disarm',()=>{const r=rig();r.seek(TRANSFER.launch-.001);const [a,b]=r.fighters;assert.ok(bladeContact(a.base,a.tip,b.offhandBase,b.offhandTip).distance<.075);assert.equal(b.offhandSaber.visible,true);r.seek(TRANSFER.launch+.005);assert.equal(b.offhandSaber.visible,false);assert.equal(r.story.flySword.visible,true);});
test('airborne saber has a ballistic arc, rotating hilt and continuous handoff',()=>{const r=rig(),a=r.story.throwFrom.toArray(),b=r.story.catchAt.toArray();assert.deepEqual(flyingSaberPosition(TRANSFER.launch,a,b),a);assert.ok(new THREE.Vector3(...flyingSaberPosition((TRANSFER.launch+TRANSFER.catch)/2,a,b)).y>6);r.seek(TRANSFER.launch+.25);const q=r.story.flySword.quaternion.clone();r.seek(TRANSFER.launch+.5);assert.ok(Math.abs(q.dot(r.story.flySword.quaternion))<.9);r.seek(TRANSFER.catch-.0001);assert.ok(r.story.flySword.position.distanceTo(r.story.catchAt)<.003);assert.ok(r.story.flySword.quaternion.angleTo(r.story.catchRotation)<.002);r.seek(TRANSFER.catch+.0001);assert.equal(r.story.flySword.visible,false);assert.equal(r.fighters[0].offhandSaber.visible,true);assert.ok(r.fighters[0].offhandSaber.getWorldPosition(new THREE.Vector3()).distanceTo(r.story.catchAt)<.003);});
test('light fighter retreats, frees the catching hand, then plants both feet for the grab',()=>{const start=duelState(TRANSFER.launch+.1).fighters[0],reach=duelState(TRANSFER.catch-.20).fighters[0],caught=duelState(TRANSFER.catch+.10).fighters[0];assert.ok(start.x-reach.x>1);assert.equal(reach.twoHand,false);assert.deepEqual(reach.feet,caught.feet);assert.ok(reach.offhand[1]>1.8);assert.equal(caught.weaponMode,'captured-dual');});
test('captured weapon launches an accelerating alternating-blade assault into the cuts',()=>{assert.ok(ASSAULT_BEATS.length>=160);const first=ASSAULT_BEATS[1]-ASSAULT_BEATS[0],last=ASSAULT_BEATS.at(-1)-ASSAULT_BEATS.at(-2);assert.ok(last<first*.57);ASSAULT_BEATS.forEach((at,i)=>{const s=duelState(at);assert.equal(s.attack.attacker,0);assert.equal(s.fighters[0].activeBlade,i%2?'offhand':'primary');assert.equal(s.fighters[0].twoHand,false);});assert.ok(ASSAULT.end-ASSAULT_BEATS.at(-1)<.24);assert.equal(duelState(ASSAULT.end+.01).attack.finisher,true);});

test('paired blades follow independent broad, continuous cuts rather than taking turns in a static guard',()=>{
  const range={hand:[Infinity,-Infinity],offhand:[Infinity,-Infinity],primaryYaw:[Infinity,-Infinity],offhandYaw:[Infinity,-Infinity],torso:[Infinity,-Infinity]},distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));let overlapping=0,samples=0;
  for(let t=ASSAULT.start+.30;t<ASSAULT.end-.05;t+=.004){
    const a=duelState(t).fighters[0],b=duelState(t+.0001).fighters[0];
    assert.equal(a.pairedFlow,true);assert.equal(a.weaponMode,'captured-dual');assert.equal(a.ignite,1);
    for(const key of ['hand','offhand']){range[key][0]=Math.min(range[key][0],a[key][0]);range[key][1]=Math.max(range[key][1],a[key][0]);assert.ok(distance(a[key],b[key])<.004,'no wrist teleport at alternating strikes');}
    for(const key of ['bladeRotation','offhandRotation'])assert.ok(distance(a[key],b[key])<.014,'continuous blade arcs');
    for(const [key,value]of [['primaryYaw',a.bladeRotation[1]],['offhandYaw',a.offhandRotation[1]],['torso',a.torsoTwist]]){range[key][0]=Math.min(range[key][0],value);range[key][1]=Math.max(range[key][1],value);}
    if(distance(a.hand,b.hand)>.00005&&distance(a.offhand,b.offhand)>.00005)overlapping++;samples++;
  }
  assert.ok(range.hand[1]-range.hand[0]>.73);assert.ok(range.offhand[1]-range.offhand[0]>.73);
  for(const key of ['primaryYaw','offhandYaw']){assert.ok(range[key][0]<-1.7);assert.ok(range[key][1]>1.7,'wide reciprocal left / right swings, not thrusts');}
  assert.ok(range.torso[1]-range.torso[0]>1.5,'torso coils into both directions');
  assert.ok(overlapping/samples>.5,'both swords move through overlapping follow-through / rechamber arcs');
});

test('the active attacking sword meets the anticipated defensive blade throughout the paired barrage',()=>{
  const r=rig();let contacts=0;
  ASSAULT_BEATS.forEach((t,index)=>{r.seek(t);const [light,dark]=r.fighters,base=index%2?light.offhandBase:light.base,tip=index%2?light.offhandTip:light.tip;
    if(bladeContact(base,tip,dark.base,dark.tip).distance<.075)contacts++;
    assert.equal(light.blade.scale.y,1);assert.equal(light.offhandSaber.visible,true);assert.equal(dark.rearBlade.visible,false);
  });
  assert.ok(contacts/ASSAULT_BEATS.length>.90,`${contacts}/${ASSAULT_BEATS.length} active-blade interceptions`);
});
