import {TRANSFER,ASSAULT,ASSAULT_BEATS,transferFootwork,transferPhase,applyTransferPose,assaultStage} from './weapon-transfer.js';
export const DURATION = 165;
export const ACT_DURATION = 48;
const BASE_CHAPTERS = [
  { start: 0, end: 6, name: 'THE APPROACH' },
  { start: 6, end: 14, name: 'FIRST CONTACT' },
  { start: 14, end: 22, name: 'ABOVE THE STORM' },
  { start: 22, end: 30, name: 'FORCE & DEFIANCE' },
  { start: 30, end: 41, name: 'NO QUARTER' },
  { start: 41, end: 48, name: 'THE LAST LIGHT' },
];
const BASE_SHOTS = [
  { start: 0, name: 'ESTABLISHING WIDE', lens: 38, type: 'wide' },
  { start: 6, name: 'LATERAL TRACKING', lens: 43, type: 'track' },
  { start: 10, name: 'BLADE-LEVEL CLOSE', lens: 48, type: 'close' },
  { start: 14, name: 'AERIAL PURSUIT', lens: 40, type: 'aerial' },
  { start: 18, name: 'GOD’S-EYE ORBIT', lens: 42, type: 'overhead' },
  { start: 20.5, name: 'LOW-ANGLE COUNTER', lens: 46, type: 'low' },
  { start: 22, name: 'THE BLADE LOCK', lens: 48, type: 'lock' },
  { start: 24.5, name: 'BREAKING THE BIND / WIDE', lens: 39, type: 'force' },
  { start: 25.45, name: 'OVER-SHOULDER / INCOMING DASH', lens: 54, type: 'ots' },
  { start: 29.8, name: 'PRESSURE REVERSAL / ARC DOLLY', lens: 42, type: 'track' },
  { start: 30, name: 'ARC DOLLY / PRESSURE REVERSAL', lens: 42, type: 'orbit' },
  { start: 34, name: 'WHIP-PAN PURSUIT', lens: 42, type: 'whip' },
  { start: 37, name: 'OVERHEAD CROSSFIRE', lens: 44, type: 'overhead' },
  { start: 39.2, name: 'GROUND-LEVEL RUSH', lens: 45, type: 'low' },
  { start: 41.5, name: 'THE FINAL COLLISION', lens: 45, type: 'close' },
  { start: 44.5, name: 'HERO WIDE', lens: 38, type: 'wide' },
];
const RAW_IMPACTS = [6.4,6.86,7.31,7.76,8.2,8.65,9.08,9.55,10.0,10.42,10.85,11.3,11.76,12.18,12.64,13.1,13.55,14.2,15.0,16.1,17.2,18.4,19.2,20.15,21.2,22.3,23.3,24.4,26.0,28.25,29.0,30.25,30.68,31.09,31.5,31.91,32.32,32.73,33.14,33.55,34.0,34.55,35.1,35.65,36.2,36.75,37.3,37.8,38.25,38.7,39.15,39.6,40.05,40.5,41.1,42.0,43.15];
export const ACT_NAMES=['THE CHALLENGE','THE PURSUIT','THE RECKONING'];
export const CHAPTERS=ACT_NAMES.flatMap((act,i)=>BASE_CHAPTERS.map(c=>({...c,start:c.start+i*48,end:c.end+i*48,name:i===0?(c.start===0?'OPENING ASSAULT':c.name):`${act} / ${c.name}`}))).concat({start:144,end:165,name:'THE FINAL JUDGMENT'});
export const SHOTS=ACT_NAMES.flatMap((_,i)=>BASE_SHOTS.map(s=>({...s,start:s.start+i*48,name:i===0?s.name:`ACT ${i+1} / ${s.name}`}))).filter(s=>s.start<TRANSFER.prepare||s.start>=ASSAULT.end).concat([
 {start:TRANSFER.prepare,name:'UPWARD DISARM / BLADE-LEVEL TWO-SHOT',lens:48,type:'transfer-launch'},
 {start:TRANSFER.launch+.24,name:'SPINNING SABER / RETREAT WIDE',lens:56,type:'transfer-flight'},
 {start:TRANSFER.catch-.54,name:'STEP BACK / HILT CATCH CLOSE',lens:44,type:'transfer-catch'},
 {start:ASSAULT.start,name:'DUAL-SABER PRESSURE / TRACKING',lens:48,type:'assault-0'},
 {start:133.7,name:'INCREASING PRESSURE / LOW TRACK',lens:45,type:'assault-1'},
 {start:140.7,name:'FINAL ACCELERATION / SHOULDER PURSUIT',lens:50,type:'assault-2'},
 {start:ASSAULT.end,name:'THREE FINAL CUTS',lens:38,type:'wide'}
]).sort((a,b)=>a.start-b.start);
export const MUSIC_BPM=168;
export const BEAT=60/MUSIC_BPM;
const EARLY_IMPACTS=Array.from({length:12},(_,i)=>(5+i)*BEAT);
const BASE_IMPACTS=[...Array.from({length:12},(_,i)=>(18+i)*BEAT),...RAW_IMPACTS.filter(x=>x>10.7).map(x=>Math.round(x/BEAT)*BEAT)].filter((x,i,a)=>!i||Math.abs(x-a[i-1])>.05);
const LOCAL_IMPACTS=[0,1,2].map(act=>[...EARLY_IMPACTS,...BASE_IMPACTS,...Array.from({length:10},(_,i)=>(124+i)*BEAT),...(act>0?[6.62,7.08,7.54,8.42,8.87,9.78,10.64,11.06,11.98,12.42,12.86,13.32]:[]),...(act===2?[30.45,30.89,31.3,31.7,32.11,32.51,32.94,33.35,34.28,34.82,35.38,35.94,36.48,37.04,37.56,38.04,38.49,38.93,39.38,39.83,40.29]:[])].sort((a,b)=>a-b));
export const IMPACTS=[...new Set([...LOCAL_IMPACTS.flatMap((list,i)=>list.map(x=>x+i*48)).filter(t=>t<TRANSFER.prepare||t>=ASSAULT.end),TRANSFER.launch,...ASSAULT_BEATS])].sort((a,b)=>a-b);
export const localTime=time=>{const t=((time%DURATION)+DURATION)%DURATION;return t>=144?47.999:t%48;};
export const actAt=time=>Math.min(2,Math.floor((((time%DURATION)+DURATION)%DURATION)/48));
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const wrapTime = t => ((t % DURATION) + DURATION) % DURATION;
export function chapterAt(t) { t = wrapTime(t); return CHAPTERS.findIndex(c => t >= c.start && t < c.end); }
export function shotAt(t) { t = wrapTime(t); return SHOTS.findLast(s => t >= s.start); }
export function impactAt(t) { return IMPACTS.findLast(x => t >= x) ?? -10; }
export function impactStrength(t) { const d = t - impactAt(t); return Math.exp(-d * 19) * (d < .4 ? 1 : 0); }
export function jump(t, start, duration, height) { const u = (t-start)/duration; return u >= 0 && u <= 1 ? Math.sin(u*Math.PI)*height : 0; }

// Authored footwork waypoints. Movement occurs only to close distance, retreat or flank.
export const FOOTWORK = [
  {t:0,a:-.12,r:1.10}, {t:1.65,a:-.12,r:1.12}, {t:5.8,a:-.12,r:1.12},
  {t:9.2,a:-.12,r:1.12}, {t:9.8,a:.42,r:1.12},
  {t:20.2,a:.42,r:1.12}, {t:20.8,a:.85,r:1.08},
  {t:22,a:.85,r:.49}, {t:24.5,a:.85,r:.49},
  {t:25.35,a:.85,r:5.85}, {t:25.45,a:.85,r:5.85},
  {t:26.30,a:.85,r:1.08}, {t:27,a:.85,r:1.08}, {t:28.3,a:.85,r:1.10},
  {t:32.2,a:.85,r:1.10}, {t:32.75,a:.2,r:1.10},
  {t:35.6,a:.2,r:1.10}, {t:36.15,a:-.4,r:1.10},
  {t:39.4,a:-.4,r:1.10}, {t:39.95,a:-.85,r:1.10},
  {t:44.6,a:-.85,r:1.10}, {t:46.0,a:-.85,r:1.10},
  {t:47.3,a:-.85,r:1.10}, {t:48,a:-.12,r:1.10},
];
export const VAULTS = [
  {side:0,start:24.5,duration:.85,height:.9,turn:0,reason:'BREAK THE BIND / BACKWARD LEAP'},
  {side:1,start:24.5,duration:.85,height:.9,turn:0,reason:'BREAK THE BIND / BACKWARD LEAP'},
  {side:0,start:25.45,duration:.85,height:1.0,turn:0,reason:'EXPLOSIVE FORWARD DASH / CENTER COLLISION'},
  {side:1,start:25.45,duration:.85,height:1.0,turn:0,reason:'EXPLOSIVE FORWARD DASH / CENTER COLLISION'},
  {side:0,start:14.8,duration:1.15,height:2.05,turn:Math.PI*2,reason:'SOMERSAULT OVER HEAD → REAR-FLANK CUT'},
  {side:1,start:18.5,duration:1.15,height:1.15,turn:Math.PI*2,reason:'SOMERSAULT EVADE → OVERHEAD COUNTER'},
  {side:0,start:33.72,duration:.95,height:1.03,turn:0,reason:'CLEAR THE LOW CUT → LANDING RIPOSTE'},
];
FOOTWORK.push({t:14.8,a:.42,r:1.12},{t:15.95,a:.42,r:1.12,lightR:-2.35},{t:17.15,a:.42,r:1.12,lightR:-1.12,darkR:-1.12},{t:18.5,a:.42,r:1.12,lightR:-1.12,darkR:-1.12},{t:19.65,a:.42,r:1.12,lightR:-1.12,darkR:2.35});FOOTWORK.sort((a,b)=>a.t-b.t);
for(const k of FOOTWORK){k.cx=k.t<2?0:k.t<6?.65:k.t<11?-.55:k.t<15?-.55:k.t<21?.65:k.t<29?0:k.t<33?.75:k.t<37?-.70:k.t<44?.65:0;}
const ATTACK_NAMES=['OVERHEAD CUT / HIGH PARRY','DIAGONAL CUT / OUTSIDE PARRY','LOW SWEEP / RISING COUNTER','REVERSE HORIZONTAL CUT / BLADE BEAT'];
export function attackAt(t){
  const whole=wrapTime(t),act=actAt(whole);t=localTime(whole);const beats=LOCAL_IMPACTS[act];
  if(whole>=ASSAULT.start&&whole<ASSAULT.end){const q=ASSAULT_BEATS.reduce((best,x,i)=>Math.abs(whole-x)<Math.abs(whole-ASSAULT_BEATS[best])?i:best,0),delta=whole-ASSAULT_BEATS[q],wind=smooth((delta+.16)/.09),cut=smooth((delta+.07)/.07),recoil=smooth(delta/.10);return{index:q,at:ASSAULT_BEATS[q],delta,act:2,attacker:0,pattern:q%4,angle:delta<-.07?lerp(-.5,-1.55,wind):delta<0?lerp(-1.55,0,cut):lerp(0,1.10,recoil),wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.07,2)),active:true,name:'DUAL-SABER ASSAULT / INCREASING PRESSURE',assault:true,assaultStage:assaultStage(whole),finalBarrage:whole>=140.7,dash:q===0};}
  if(whole>=ASSAULT.end){const cuts=[418*BEAT,425*BEAT,432*BEAT];let index=cuts.reduce((best,x,i)=>Math.abs(whole-x)<Math.abs(whole-cuts[best])?i:best,0);const delta=whole-cuts[index],wind=smooth((delta+.30)/.20),cut=smooth((delta+.10)/.10),recoil=smooth(delta/.16);return{index,at:cuts[index],delta,act:2,attacker:0,pattern:index===2?0:1,angle:delta<-.1?lerp(-1.10,-1.45,wind):delta<0?lerp(-1.45,0,cut):lerp(0,.32,recoil),wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.09,2)),active:whole<160.2,name:['LEFT ARM / DISARM','RIGHT ARM / DISARM','THE FINAL CUT'][index],finisher:true};}
  if(transferPhase(whole)){const delta=whole-TRANSFER.launch,wind=smooth((delta+.27)/.16),cut=smooth((delta+.12)/.12),recoil=smooth(delta/.18);return{index:348,at:TRANSFER.launch,delta,act:2,attacker:0,pattern:2,angle:delta<-.12?lerp(-.5,-1.4,wind):delta<0?lerp(-1.4,0,cut):lerp(0,1.10,recoil),wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.085,2)),active:Math.abs(delta)<.32,name:'UPWARD BLADE BEAT / SPINNING DISARM',disarm:true};}
  const next=beats.findIndex(x=>x>=t),a=next<0?beats.length-1:next;
  const index=a>0&&Math.abs(t-beats[a-1])<Math.abs(t-beats[a])?a-1:a,delta=t-beats[index];
  const wind=delta<0?smooth((delta+.23)/.155):1,cut=smooth((delta+.075)/.075),recoil=smooth(delta/.11);
  const angle=delta<-.075?lerp(-.55,-1.45,wind):delta<0?lerp(-1.45,0,cut):lerp(0,1.05,recoil);
  if(whole>=65.85&&whole<70){const cuts=[186*BEAT,191*BEAT,192*BEAT,193*BEAT,194*BEAT,195*BEAT],j=cuts.reduce((best,x,i)=>Math.abs(whole-x)<Math.abs(whole-cuts[best])?i:best,0),delta=whole-cuts[j],wind=smooth((delta+.24)/.15),cut=smooth((delta+.08)/.08),recoil=smooth(delta/.13);return{index:186+j,at:cuts[j],delta,act:1,attacker:j?0:1,pattern:j?j%4:0,angle:delta<-.08?lerp(-.5,-1.4,wind):delta<0?lerp(-1.4,0,cut):lerp(0,.95,recoil),wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.09,2)),active:Math.abs(delta)<.25,name:j?'PILLAR KICK-OFF / RETURN ASSAULT':'HEAVY OVERHEAD / GUARDED KNOCKBACK',knockback:true};}
  if(whole>=86.4&&whole<92){const cuts=[250*BEAT,251*BEAT,253*BEAT,255*BEAT],localIndex=cuts.reduce((best,x,i)=>Math.abs(whole-x)<Math.abs(whole-cuts[best])?i:best,0),delta=whole-cuts[localIndex],wind=smooth((delta+.25)/.16),cut=smooth((delta+.08)/.08),recoil=smooth(delta/.12);return{index:250+localIndex,at:cuts[localIndex],delta,act:1,attacker:0,pattern:localIndex===0?0:localIndex%2?1:3,angle:delta<-.08?lerp(-.5,-1.4,wind):delta<0?lerp(-1.4,0,cut):lerp(0,.9,recoil),wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.08,2)),active:Math.abs(delta)<.25,name:localIndex===0?'FORCE-HURLED PILLAR / BLUE CLEAVE':'AERIAL DRIVE / IMMEDIATE FOLLOW-UP CUT',pillarCut:localIndex===0};}

  return{index,at:beats[index]+act*48,delta,act,attacker:(Math.floor(index/12)+act)%2,pattern:(index+act)%4,angle,wind,cut,recoil,drive:Math.exp(-Math.pow(delta/.075,2)),active:Math.abs(delta)<.26,name:ATTACK_NAMES[(index+act)%4],dash:act>0&&index%6===0};
}
function footworkSegment(t){let idx=FOOTWORK.findLastIndex(x=>t>=x.t);idx=Math.min(idx,FOOTWORK.length-2);const a=FOOTWORK[Math.max(0,idx)],b=FOOTWORK[idx+1],u=clamp((t-a.t)/(b.t-a.t));return{a,b,u,e:smooth(u),moving:Math.abs((a.cx||0)-(b.cx||0))>.01||Math.abs(a.a-b.a)>.01||Math.abs(a.r-b.r)>.01||(a.darkR??a.r)!==(b.darkR??b.r)};}
function anchor(k,i,leg){const angle=k.a+(i?0:Math.PI),radius=i?(k.darkR??k.r):(k.lightR??k.r),x=Math.cos(angle)*radius+(k.cx||0),z=Math.sin(angle)*radius,yaw=Math.atan2(-x,-z)+(i?-.30:.30),side=leg===0?-.20:.20,forward=leg===0?.31:-.31;return[x+Math.cos(yaw)*side+Math.sin(yaw)*forward,.06,z-Math.sin(yaw)*side+Math.cos(yaw)*forward];}
export function rootMotion(time,i,scripted=true){
  const t=localTime(time),chapter=BASE_CHAPTERS.findIndex(c=>t>=c.start&&t<c.end),attack=attackAt(time),k=footworkSegment(t);
  let radius=lerp(i?(k.a.darkR??k.a.r):(k.a.lightR??k.a.r),i?(k.b.darkR??k.b.r):(k.b.lightR??k.b.r),k.e),orbit=lerp(k.a.a,k.b.a,k.e);
  if(attack.active&&t>1.6&&t<44){if(attack.attacker===i)radius-=attack.drive*(attack.dash?.48:.22);else radius+=attack.drive*.055;}
  const theta=orbit+(i?0:Math.PI);let x=Math.cos(theta)*radius+lerp(k.a.cx||0,k.b.cx||0,k.e),z=Math.sin(theta)*radius;
  let y=0,flip=0,flight,flightIntent;
  for(const v of VAULTS){if(v.side!==i)continue;const u=(t-v.start)/v.duration;if(u>=0&&u<=1){y=4*v.height*u*(1-u);flight=u;flip=v.turn*smooth((u-.12)/.76);flightIntent=v.reason;}}
  const otherRadius=lerp(i?(k.a.lightR??k.a.r):(k.a.darkR??k.a.r),i?(k.b.lightR??k.b.r):(k.b.darkR??k.b.r),k.e),otherTheta=orbit+(i?Math.PI:0),otherX=Math.cos(otherTheta)*otherRadius+lerp(k.a.cx||0,k.b.cx||0,k.e),otherZ=Math.sin(otherTheta)*otherRadius;
  if(flight!==undefined){x+=Math.sin(orbit)*Math.sin(flight*Math.PI)*.22;z-=Math.cos(orbit)*Math.sin(flight*Math.PI)*.22;}
  const pose={x,y,z,yaw:Math.atan2(otherX-x,otherZ-z),flip,flight,flightIntent,chapter};
  if(scripted&&time>=TRANSFER.prepare&&time<ASSAULT.end)return{...pose,...transferFootwork(time,i,rootMotion(TRANSFER.prepare,i,false))};
  return pose;
}
export function plantedFeet(t,i){
  const r=rootMotion(t,i),attack=attackAt(t),whole=t;t=localTime(t);if(r.scriptFeet)return r.scriptFeet;if(r.y>.035)return null;
  const k=footworkSegment(t);
  return[0,1].map(leg=>{const a=anchor(k.a,i,leg),b=anchor(k.b,i,leg);if(!k.moving){if(attack.dash&&attack.attacker===i&&leg===0){const d=attack.drive*.43;return[a[0]+Math.sin(r.yaw)*d,.06+Math.sin(attack.drive*Math.PI)*.04,a[2]+Math.cos(r.yaw)*d];}return a;}
    // The lead foot initiates a real reposition, the rear foot follows. Otherwise both stay planted.
    const distance=Math.hypot(b[0]-a[0],b[2]-a[2]),steps=Math.max(1,Math.ceil(distance/.34)),phase=Math.min(steps-.000001,k.e*steps),cycle=Math.floor(phase),part=phase-cycle,u=clamp((part-(leg===0?.04:.46))/.36),e=(cycle+smooth(u))/steps,skid=k.a.t>=25.6&&k.a.t<28.3;
    if(distance<.005)return a;return[lerp(a[0],b[0],e),.06+(skid?0:Math.sin(u*Math.PI)*.10),lerp(a[2],b[2],e)];
  });
}
export function duelState(time){
  const whole=wrapTime(time),t=localTime(time),chapter=chapterAt(time),attack=attackAt(time),height= t>=22&&t<24.5?1.74:[1.85,1.62,1.12,1.5][attack.pattern];
  const fighters=[0,1].map(i=>{
    const r=rootMotion(time,i);if(whole>=ASSAULT.end){r.x=i?.82:-.84;r.z=0;r.y=0;r.yaw=i?-Math.PI/2:Math.PI/2;r.flip=0;r.flightIntent=undefined;r.chapter=5;}if(whole>=86.4&&whole<92){const u=clamp((whole-250*BEAT)/1.25);r.x=i?2.60+smooth(u)*1.7:lerp(-2.6,2.05,smooth(u));r.z=i?-.35:.35;r.y=i?0:(u>0&&u<1?4*.95*u*(1-u):0);r.yaw=i?-Math.PI/2:Math.PI/2;r.flip=0;r.flightIntent=r.y>.035?'BLUE CLEAVE / AERIAL ATTACK THROUGH PILLAR HALVES':undefined;}
    if(whole>=65.85&&whole<70){const u=clamp((whole-186*BEAT)/(2*BEAT));const recovery=smooth((whole-67.82)/.70);r.x=i?1.05:(whole>=67.82?lerp(-5.50,-1.05,1-Math.pow(1-recovery,2)):lerp(-1.05,-5.50,smooth(u)));r.z=i?0:lerp(0,1.05,smooth(u));r.y=i?0:(u>0&&u<1?4*.80*u*(1-u):whole>67.82&&whole<68.52?4*.95*((whole-67.82)/.70)*(1-(whole-67.82)/.70):0);r.yaw=i?-Math.PI/2:Math.PI/2;r.flip=i?0:-.23*Math.sin(u*Math.PI);r.flightIntent=r.y>.035?(whole>=67.82?'PILLAR KICK-OFF / IMMEDIATE COUNTERASSAULT':'GUARDED KNOCKBACK / PILLAR COLLISION'):undefined;if(i===0&&whole>=67.14&&whole<67.82){r.wallBrace=true;r.y=.2;r.x=lerp(-5.50,-5.50,smooth((whole-67.142857)/.16));r.flightIntent='PILLAR FOOT BRACE / EXPLOSIVE KICK-OFF';}}
    if(i===0&&whole>=157.5)r.yaw=lerp(Math.PI/2,.28,smooth((whole-157.5)/1.0));
    const attacking=attack.attacker===i,drive=attack.active?attack.drive:0,active=t>1.5||attack.finisher||attack.finalBarrage;
    const pre=attack.delta<0?smooth((attack.delta+(attack.finisher?.50:.23))/(attack.finisher?.40:.155)):1,stroke=smooth((attack.delta+(attack.finisher?.09:.075))/(attack.finisher?.09:.075)),follow=smooth(attack.delta/.14);
    const windups=[[.15,1.94,-.12],[.55,1.64,-.12],[.35,1.00,.03],[.23,1.51,.14]],w=windups[attack.pattern],impact=[.16,height-.26,.64],recovery=[.02,height-.32,.46];
    let hand;
    if(!active)hand=[.24,1.45,.38];
    else if(!attacking)hand=[.28,lerp(1.44,height-.20,drive),.54];
    else if(attack.delta<-.075)hand=w.map((v,j)=>lerp([.24,1.45,.36][j],v,pre));
    else if(attack.delta<0)hand=w.map((v,j)=>lerp(v,impact[j],stroke));
    else hand=impact.map((v,j)=>lerp(v,recovery[j],follow));
    const hipTurn=(i?-.30:.30)+(attacking&&active?lerp(-.22,.25,stroke)*pre:drive*.10),torsoTwist=attacking&&active?lerp(-.48,.38,stroke)*pre:-.25*drive;
    const weaponMode=i===1?(whole<324*BEAT?'staff':whole<TRANSFER.launch?'dual':'single'):(whole>=TRANSFER.catch?'captured-dual':'single');
    const staffSpin=i===1&&weaponMode==='staff'&&t>=7.6&&t<8.65?{stage:Math.min(2,Math.floor((t-7.6)/.35)),phase:(t-7.6)*Math.PI*7}:null;
    if(staffSpin)hand=[[0,1.36,.42],[0,1.98,.02],[0,1.35,-.43]][staffSpin.stage];
    if(whole>=65.85&&whole<68.52&&i===0)hand=[.12,1.70,.42];
    if(t>=22&&t<24.5)hand=[.12,1.54,.32];
    const activeBlade=i===0&&(attack.finisher||attack.assault)?((attack.finisher?attack.index===1:attack.index%2)?'offhand':'primary'):undefined;
    if(activeBlade==='offhand')hand=[.28,1.52,.22];if(i===0&&whole>=157.5){const u=smooth((whole-157.5)/1.3);hand=[lerp(.28,.17,u),lerp(1.52,.96,u),lerp(.22,-.10,u)];}
    const dual=weaponMode==='dual'||weaponMode==='captured-dual';
    const pose={...r,afterFight:i===0&&whole>=154.65,weaponMode,staffSpin,activeBlade,saberAim:i===0&&whole>=154.65?[.12,-.55,1]:i===0&&whole>=250*BEAT&&whole<89.42?[0,-.66,1]:i===0&&whole>=186*BEAT&&whole<67.90?[.15,.80,.40]:undefined,hipTurn:i===0&&whole>=154.65?0:(i===0&&whole>=157.5?lerp(hipTurn,.14,smooth((whole-157.5)/1.0)):hipTurn)+(staffSpin?.7*staffSpin.stage/2:i===1&&active&&attack.index%4===2?.42*pre:0),torsoTwist:i===0&&whole>=154.65?0:i===0&&whole>=157.5?torsoTwist*(1-smooth((whole-157.5)/1.3)):attack.finisher&&i===0?(attack.index===1?-1:1)*lerp(-.66,.56,stroke)*pre:torsoTwist,lean:i===0&&whole>=154.65?0:r.wallBrace?-.18:t>=22&&t<24.5?.20:attacking&&active?.04+drive*.22:-drive*.17,stride:drive,crouch:i===0&&whole>=154.65?0:r.wallBrace?.30:r.y>.035?.12:.17+drive*.12,feet:i===0&&whole>=154.65?[[-.64-Math.cos(r.yaw)*.32,.06,Math.sin(r.yaw)*.32],[-.64+Math.cos(r.yaw)*.32,.06,-Math.sin(r.yaw)*.32]]:r.scriptFeet?r.scriptFeet:r.wallBrace?[[-5.815,.78,1.05],[-5.815,1.30,1.20]]:r.y>.035?null:(whole>=142||whole>=86.4&&whole<92||whole>=65.85&&whole<70)?[[r.x-Math.cos(r.yaw)*.20+Math.sin(r.yaw)*.27,.06,r.z+Math.sin(r.yaw)*.20+Math.cos(r.yaw)*.27],[r.x+Math.cos(r.yaw)*.20-Math.sin(r.yaw)*.27,.06,r.z-Math.sin(r.yaw)*.20-Math.cos(r.yaw)*.27]]:plantedFeet(time,i),hand:i===0&&whole>=154.65?(whole>=157.5&&whole<158.85?hand:[.29,.89,.04]):hand,offhand:i===0&&whole>=155.65?[-.29,.89,.04]:activeBlade==='offhand'?[lerp(-.45,-.10,stroke),lerp(1.93,1.49,stroke),lerp(-.09,.64,stroke)]:dual?[-.43,1.38+drive*.2,.48]:[-.34,1.35,.30],twoHand:!dual&&!(i===1&&whole>=86.4&&whole<88.2),rearStrike:weaponMode==='staff'&&i===1&&active&&attack.index%2===1,attackPlane:attack.pattern===1||attack.pattern===3?'horizontal':'vertical',attackAngle:active?(attacking?attack.angle:-attack.angle*.18):-.3,ignite:i===0&&whole>=158.10?1-smooth((whole-158.10)/.35):clamp((whole-.7-i*.14)*4)};
    applyTransferPose(pose,whole,i,attack);return pose;
  });
  let contact=[(fighters[0].x+fighters[1].x)*.5,height,0];if(whole>=65.85&&whole<70)contact=[0,1.8,0];if(whole>=86.4&&whole<250*BEAT+.16)contact=[-1.55,1.70,.35];if(attack.finisher)contact=[.82,attack.index===2?1.90:1.43,attack.index===0?-.23:attack.index===1?.23:0];const lock=t>=22&&t<24.5;
  return{time:whole,localTime:t,act:actAt(time),chapter,shot:shotAt(whole),fighters,contact,lock,attack,impact:impactStrength(whole),force:jump(t,25.8,1.35,1),intent:fighters.find(f=>f.staffSpin)?['FRONT STAFF SPIN','OVERHEAD STAFF SPIN','BEHIND-BACK STAFF SPIN'][fighters[1].staffSpin.stage]:fighters.find(f=>f.flightIntent)?.flightIntent||attack.name};
}
