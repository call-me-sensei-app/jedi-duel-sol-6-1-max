/** Authored combinations. Each contact releases into the next chamber, never an idle reset. */
const clamp=u=>Math.max(0,Math.min(1,u)),ease=u=>{u=clamp(u);return u*u*u*(u*(u*6-15)+10);};
const mix=(a,b,u)=>a+(b-a)*u;
const blend=(a,b,u)=>Array.isArray(a)?a.map((v,i)=>mix(v,b[i],u)):mix(a,b,u);
const heights=[1.82,1.55,1.12,1.53],axes=[[-1,0],[-.55,.82],[.15,1],[0,1]];
const cadences=[[.29,.24,.27,.23,.31,.25],[.26,.22,.30,.23,.27,.25],[.25,.21,.24,.29,.22,.27]];
const phrases=[
  [1.45,12,0,'TWELVE-CUT OPENING',0], [4.78,12,1,'DARK-SIDE ANSWER',1],
  [8.02,14,0,'OUTSIDE PARRY / RETURN',2], [11.70,10,1,'DRIVING STAFF COMBINATION',1],
  [14.50,14,0,'VAULT / REAR-FLANK ATTACK',2], [18.18,14,1,'TURN / COUNTER-CUT',2],
  [23.18,5,0,'BREAK THE GUARD',1], [26.25,14,1,'CENTER COLLISION / COUNTER',2],
  [29.85,15,0,'DRIVE TO THE EDGE',1], [33.80,13,1,'LOW CUT / PURSUIT',2],
  [37.18,13,0,'INSIDE-LINE REPRISE',2], [40.56,14,1,'STAFF PRESSURE / RETREAT',1],
  [44.28,14,0,'NO RESET / ACT TRANSITION',2],
];
export const COMBAT_EVENTS=[];
for(let act=0;act<3;act++)for(let phrase=0;phrase<phrases.length;phrase++){
  const [start,count,owner,name,cadence]=phrases[phrase];let at=start+48*act;
  for(let j=0;j<count;j++){
    if(at>=123.55)break;
    const counter=phrase>=2&&j%6>=4;
    if(!(at>=65.85&&at<70||at>=86.4&&at<92))COMBAT_EVENTS.push({at,index:COMBAT_EVENTS.length,act,attacker:(owner+act+(counter?1:0))%2,pattern:[3,3,0,0,1,1,2,2][(j+phrase*2+act*2)%8],sign:j%2?-1:1,phrase,phraseStrike:j,counter,name:counter?'PARRY → TWO-CUT RIPOSTE':name});
    at+=cadences[cadence][j%6]*(act===2?.93:act===1?.97:1);
  }
}
for(const [act,start]of [[1,47.85],[2,95.6]])for(let j=0;j<6;j++){const at=start+j*.26;if(!COMBAT_EVENTS.some(e=>Math.abs(e.at-at)<.18))COMBAT_EVENTS.push({at,act,attacker:act%2,pattern:j%2?3:1,sign:j%2?-1:1,phrase:13,phraseStrike:j,name:'ATTACK THROUGH THE ACT TRANSITION'});}
COMBAT_EVENTS.sort((a,b)=>a.at-b.at);COMBAT_EVENTS.forEach((e,i)=>e.index=i);
export function connectedAttackAt(t,events=COMBAT_EVENTS){
  let lo=0,hi=events.length-1;
  while(lo<hi){const m=(lo+hi)>>1;if(events[m].at<t-1e-9)lo=m+1;else hi=m;}
  const next=events[lo],previous=events[Math.max(0,lo-1)],near=Math.abs(t-previous.at)<Math.abs(t-next.at)?previous:next,delta=t-near.at;
  const first=lo===0,a=first?{...next,at:next.at-.30}:previous,gap=next.at-a.at;
  const release=Math.min(.045,gap*.20),chamber=Math.min(.058,gap*.25),elapsed=t-a.at;
  const u=ease((t-a.at)/gap),height=mix(heights[a.pattern],heights[next.pattern],u);
  return{...near,delta,previous:a,next,release,chamber,hold:Math.min(.018,gap*.065),height,connected:true,active:t>=1.30,drive:Math.exp(-Math.pow(delta/.065,2)),wind:1,cut:1,recoil:1,angle:0,dash:near.phraseStrike===0&&near.phrase>=6,phase:elapsed<.024?'CONTACT / WEIGHT':elapsed<release?'FOLLOW-THROUGH':t<next.at-chamber?'CHAINED RECHAMBER':'ACCELERATING CUT',first};
}
function poseKey(event,i,phase){
  const attacking=event.attacker===i,sign=event.sign,h=heights[event.pattern],axis=axes[event.pattern];
  const impact=[.18,h-.23,.61],guard=[.25,h-.18,.54];
  if(!attacking){
    const high=event.pattern===0,low=event.pattern===2,diagonal=event.pattern===1;
    const contact=high?[-.28*sign,1.48,.48]:low?[.32*sign,.87,.48]:diagonal?[.38*sign,h-.28,.40]:[.40*sign,1.22,.44];
    const chamber=high?[-.38*sign,1.77,.34]:low?[.27*sign,1.35,.25]:diagonal?[-.14*sign,h+.17,.52]:[-.20*sign,1.51,.47];
    const follow=high?[.23*sign,1.44,.32]:low?[.02*sign,1.18,.56]:diagonal?[.45*sign,h-.48,.24]:[.43*sign,1.37,.34];
    const rotation=phase==='contact'?[0,0]:axis.map(v=>v*sign*(phase==='follow'?-.50:.72));if(high&&phase!=='contact')rotation[0]=(i?-1:1)*(phase==='chamber'?.65:-.42);
    return{hand:phase==='contact'?contact:phase==='follow'?follow:chamber,rotation,hipTurn:(i?-.22:.22)+sign*(phase==='chamber'?-.18:phase==='contact'?.16:.23),torsoTwist:sign*(phase==='chamber'?-.32:phase==='contact'?.24:.34),lean:phase==='contact'?-.14:phase==='follow'?.07:-.045,crouch:phase==='contact'?.29:phase==='follow'?.21:.23};
  }
  return phase==='contact'?{hand:impact,rotation:[0,0],hipTurn:(i?-.22:.22)+.24*sign,torsoTwist:.36*sign,lean:.18,crouch:.27}:
    phase==='follow'?{hand:[-.20*sign,h-.30,.44],rotation:axis.map(v=>v*sign*1.16),hipTurn:(i?-.22:.22)+.32*sign,torsoTwist:.54*sign,lean:.11,crouch:.22}:
    {hand:[.31*sign,event.pattern===0?1.85:h+.02,.14],rotation:axis.map(v=>-v*sign*1.22),hipTurn:(i?-.22:.22)-.30*sign,torsoTwist:-.48*sign,lean:-.025,crouch:.19};
}
export function connectedPoseAt(t,attack,i){
  const a=attack.previous,b=attack.next,gap=b.at-a.at,dt=t-a.at;
  let from,to,u;
  if(dt<=attack.release){from=poseKey(a,i,'contact');to=poseKey(a,i,'follow');u=ease((dt-attack.hold)/(attack.release-attack.hold));}
  else if(t<b.at-attack.chamber){from=poseKey(a,i,'follow');to=poseKey(b,i,'chamber');u=ease((dt-attack.release)/(gap-attack.release-attack.chamber));}
  else{from=poseKey(b,i,'chamber');to=poseKey(b,i,'contact');u=ease((t-b.at+attack.chamber)/attack.chamber);}
  const p=Object.fromEntries(Object.keys(from).map(key=>[key,blend(from[key],to[key],u)]));
  if(attack.first&&t<a.at){p.hand=[.24,1.45,.38];p.rotation=[-.3,0];p.hipTurn=i?-.22:.22;p.torsoTwist=0;p.lean=0;p.crouch=.17;}
  return p;
}
