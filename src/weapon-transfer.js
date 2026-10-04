/** A readable, causally connected disarm → retreat → catch → pressure sequence. */
const beat=60/168;
export const TRANSFER={prepare:123.55,launch:348*beat,catch:354*beat,recover:126.70};
export const ASSAULT={start:TRANSFER.recover,end:148.78};
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,u)=>a+(b-a)*u;
export function transferPhase(t){return t<TRANSFER.prepare||t>=ASSAULT.start?'':t<TRANSFER.launch+.24?'launch':t<TRANSFER.catch-.54?'flight':'catch';}
export function flyingSaberPosition(t,from,to){const u=clamp((t-TRANSFER.launch)/(TRANSFER.catch-TRANSFER.launch)),duration=TRANSFER.catch-TRANSFER.launch;return from.map((v,i)=>mix(v,to[i],u)+(i===1?.5*9.81*duration*duration*u*(1-u):0));}
export const ASSAULT_BEATS=[];
for(let t=ASSAULT.start+.24;t<ASSAULT.end-.03;){ASSAULT_BEATS.push(t);const u=clamp((t-ASSAULT.start)/(ASSAULT.end-ASSAULT.start));t+=mix(.46,.235,ease(u));}
export function assaultStage(t){return t<133.7?0:t<140.7?1:2;}
const waypoints=[
 {t:TRANSFER.prepare,x:[-1.05,1.05]}, {t:TRANSFER.launch+.10,x:[-1.05,1.05]},
 {t:TRANSFER.catch-.27,x:[-2.20,1.05]}, {t:ASSAULT.start,x:[-2.20,1.05]},
 {t:ASSAULT.start+.55,x:[-1.10,1.10]}, {t:130.5,x:[-.15,1.95]},
 {t:135.5,x:[.85,2.95]}, {t:140.5,x:[1.40,3.50]},
 {t:142.0,x:[.84,2.94]}, {t:145.5,x:[-.84,.82]}, {t:ASSAULT.end,x:[-.84,.82]},
];
export function transferFootwork(t,i,initial){
 const k=Math.max(0,Math.min(waypoints.length-2,waypoints.findLastIndex(w=>t>=w.t))),a=waypoints[k],b=waypoints[k+1],u=clamp((t-a.t)/(b.t-a.t)),distance=b.x[i]-a.x[i],steps=Math.max(1,Math.ceil(Math.abs(distance)/.55)),phase=Math.min(steps-.000001,u*steps),cycle=Math.floor(phase),part=phase-cycle;
 const e=(cycle+ease(part))/steps,x=mix(a.x[i],b.x[i],u>=1?1:e),yaw=i?-Math.PI/2:Math.PI/2;
 const feet=[0,1].map(leg=>{const lead=distance<0?1:0,start=leg===lead?.02:.43,p=clamp((part-start)/.50),progress=(cycle+ease(p))/steps;return[mix(a.x[i],b.x[i],u>=1?1:progress)+(i?-1:1)*(leg===0?.29:-.29),.06+(Math.abs(distance)>.01?Math.sin(p*Math.PI)*.095:0),leg===0?.22:-.22];});
 const blend=ease((t-TRANSFER.prepare)/.40);
 return{x:mix(initial.x,x,blend),z:mix(initial.z,0,blend),y:0,yaw:mix(initial.yaw,yaw,blend),flip:0,flightIntent:undefined,scriptFeet:feet.map((f,leg)=>{const side=leg===0?-.20:.20,front=leg===0?.29:-.29,initialFoot=[initial.x+Math.cos(initial.yaw)*side+Math.sin(initial.yaw)*front,.06,initial.z-Math.sin(initial.yaw)*side+Math.cos(initial.yaw)*front];return f.map((v,j)=>mix(initialFoot[j],v,blend));})};
}
export function applyTransferPose(p,t,i,attack){
 const phase=transferPhase(t);p.transferPhase=phase;
 if(phase){
  p.crouch=.25;p.hipTurn=i?-.16:.16;p.torsoTwist=i?.12:-.12;
  if(i===0){
   const d=t-TRANSFER.launch,cut=ease((d+.12)/.12);
   p.hand=phase==='launch'?[.18,mix(1.05,1.60,cut),.48]:[.27,1.61,.38];
   p.saberAim=phase==='launch'?[.06,mix(-.45,.84,cut),.64]:[.10,.87,.40];
   p.hipTurn=phase==='launch'?mix(-.28,.32,cut):.16;p.torsoTwist=phase==='launch'?mix(-.42,.38,cut):-.12;
   const reach=ease((t-(TRANSFER.catch-.64))/.38);p.offhand=[mix(-.35,-.38,reach),mix(1.29,1.94,reach),mix(.30,.46,reach)];
   if(t>=TRANSFER.catch-.64)p.twoHand=false;
   p.offhandAim=[-.12,.90,.43];
   if(t>=TRANSFER.catch){const u=ease((t-TRANSFER.catch)/(ASSAULT.start-TRANSFER.catch));p.offhand=p.offhand.map((v,j)=>mix(v,[-.43,1.50,.48][j],u));p.offhandAim=p.offhandAim.map((v,j)=>mix(v,[-.65,.35,.10][j],u));}
  }else{p.hand=[.25,1.56,.45];p.offhand=[-.40,1.48,.43];p.offhandAim=[.05,.28,.96];p.saberAim=[.1,.78,.54];}
 }
 if(attack.assault){p.crouch=.22+attack.drive*.10;p.pressure=attack.assaultStage;p.lean=i===0?.08+attack.drive*.22:-.08-attack.drive*.18;}
}
