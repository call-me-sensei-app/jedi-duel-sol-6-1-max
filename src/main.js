import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createWorld} from './world.js';
import {Fighter} from './figure.js';
import {bladeContact} from './biomechanics.js';
import {DuelEffects} from './effects.js';
import {DuelAudio} from './audio.js';
import {FILM_MIX} from './sound-mix.js';
import {Narrative} from './narrative.js';
import {PillarSetPiece,PILLAR} from './pillar.js';
import {KnockbackSetPiece} from './knockback.js';
import {cinematicRate,finalCameraStage} from './cinematic.js';
import {ScoreClock} from './score-sync.js';
import {TRANSFER,ASSAULT,transferPhase} from './weapon-transfer.js';
import scoreCues from './score-cues.json';
import {duelState,DURATION,CHAPTERS,wrapTime} from './choreography.js';
import './style.css';
const $=s=>document.querySelector(s);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;$('#scene').append(renderer.domElement);
renderer.info.autoReset=false;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);const world=createWorld(scene,renderer);
const fighters=[new Fighter(scene,0),new Fighter(scene,1)];
fighters[0].equipOffhand(fighters[1].saber);
const fx=new DuelEffects(scene),audio=new DuelAudio(),narrative=new Narrative(scene,fighters,fx,audio);
const pillar=new PillarSetPiece(scene,world.stone,fx,audio);
const knockback=new KnockbackSetPiece(scene,world.stone,fx,audio);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.4,3.0);composer.addPass(bloom);composer.addPass(new OutputPass());
let t=1.35,playing=true,speed=1,cameraMode=0,last=performance.now(),frames=0,fpsTime=last,frameMs=[],ready=false;
let renderTime=t,hitStop=0,contacting=false,audioFrameAt=performance.now();const previousAirTips=new Map();const previousTips=fighters.map(()=>new THREE.Vector3());
let score=new Audio('/audio/jedi-experiment.mp3'),scoreUrl,scoreBpm=168,scoreOffset=0,scoreClock=new ScoreClock(scoreCues.cues),silentMusic=scoreClock.musicAt(t);
score.preload='auto';score.volume=FILM_MIX.music;score.muted=true;score.addEventListener('loadedmetadata',()=>{if(scoreClock)score.currentTime=scoreClock.musicAt(t);},{once:true});
$('#score-load').textContent='♫ SCORE LINKED';$('#score-load').title='Jedi Experiment · local soundtrack · onset-synced';$('#beat').textContent='ONSET SYNC';
const clockText=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
$('#total-time').textContent=clockText(scoreCues.duration_seconds);
async function updateMeter(){try{let u;try{const response=await fetch(import.meta.env.DEV?'/api/experiment-metrics':'/progress/usage.json',{cache:'no-store'});u=await response.json();}catch{u=await fetch('/progress/usage.json',{cache:'no-store'}).then(r=>r.json());}if(!u.tokens)return;$('#meter-tokens').textContent=u.tokens.total_tokens.toLocaleString();$('#meter-cost').textContent=`$${u.api_equivalent_usd.toFixed(4)}`;const seconds=Math.floor(u.development_time.elapsed_seconds);$('#meter-time').textContent=`${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('.meter-title').lastChild.textContent=u.building===false?' RECORDED DEVELOPMENT LEDGER':' LIVE DEVELOPMENT LEDGER';}catch{$('#meter-tokens').textContent='LEDGER UNAVAILABLE';}}
updateMeter();setInterval(updateMeter,8000);
const cameraTarget=new THREE.Vector3(),desired=new THREE.Vector3();
const cameraLook=new THREE.Vector3(),cameraFrom=new THREE.Vector3(),lookFrom=new THREE.Vector3();let cameraKey='',cameraChangeAt=0,cameraFovFrom=38;const poseHistory=[null,null];
function updateCamera(state,pillarState,knockState,dt){
  const previousFov=camera.fov;
  const pillarCamera=state.time>=PILLAR.cut-.18&&state.time<PILLAR.cut+.16?'cut':pillarState?.phase;
  const type=cameraMode===1?'wide':cameraMode===2?'orbit':cameraMode===3?'overhead':knockState?.active?'knock-'+knockState.phase:pillarState?.active?'pillar-'+pillarCamera:transferPhase(state.time)?'transfer-'+transferPhase(state.time):state.attack.assault?'assault-'+state.attack.assaultStage:state.time>=ASSAULT.end?'finish-'+finalCameraStage(state.time):state.shot.type;
  const time=state.localTime,battleAngle=Math.atan2(state.fighters[1].z-state.fighters[0].z,state.fighters[1].x-state.fighters[0].x),sideAngle=battleAngle+1.46,center=new THREE.Vector3((state.fighters[0].x+state.fighters[1].x)*.5,1.5+Math.max(...state.fighters.map(x=>x.y))*.4,0),angle=time*.12;
  switch(type){
    case 'transfer-launch':desired.set(3.8,2.35,6.3);cameraTarget.set(0,1.65,0);break;
    case 'transfer-flight':desired.set(1.0,4.0,9.4);cameraTarget.set((state.fighters[0].x+state.fighters[1].x)*.5,Math.max(2.35,(narrative.flightPosition.y+1.3)*.44),0);break;
    case 'transfer-catch':{const reach=THREE.MathUtils.smoothstep(state.time,TRANSFER.catch-.54,TRANSFER.catch);desired.set(-4.8,2.6+(1-reach),3.2+(1-reach)*1.3);cameraTarget.copy(fighters[0].offhandSaber.getWorldPosition(new THREE.Vector3()));if(narrative.flySword.visible)cameraTarget.lerp(narrative.flightPosition,(1-reach)*.65);break;}
    case 'assault-0':desired.set(center.x-.55,2.85,6.6);cameraTarget.copy(center);break;
    case 'assault-1':desired.set(center.x-2.4,1.65,6.8);cameraTarget.copy(center);break;
    case 'assault-2':desired.set(state.fighters[0].x-2.0,2.10,1.7);cameraTarget.set(state.fighters[1].x,1.46,0);break;
    case 'track':desired.set(center.x+Math.cos(sideAngle+.15)*6.6,3.1,Math.sin(sideAngle+.15)*6.6);cameraTarget.copy(center);break;
    case 'close':desired.set(center.x+Math.cos(sideAngle)*5.0,2.65,Math.sin(sideAngle)*5.0);cameraTarget.copy(center);break;
    case 'aerial':desired.set(6.7,5.4,7.2);cameraTarget.copy(center);break;
    case 'overhead':desired.set(Math.sin(angle)*1.8,11,Math.cos(angle)*2.5);cameraTarget.copy(center);break;
    case 'low':desired.set(center.x+Math.cos(sideAngle)*6.0,1.35,Math.sin(sideAngle)*6.0);cameraTarget.copy(center);break;
    case 'lock':desired.set(center.x+Math.cos(sideAngle)*5.4,2.75,Math.sin(sideAngle)*5.4);cameraTarget.copy(center);break;
    case 'force':desired.set(5.5,9.5,8.5);cameraTarget.copy(center);break;
    case 'ots':{const hero=state.fighters[0],enemy=state.fighters[1],dx=enemy.x-hero.x,dz=enemy.z-hero.z,n=Math.hypot(dx,dz)||1;desired.set(hero.x-dx/n*1.35+dz/n*.45,1.85+hero.y,hero.z-dz/n*1.35-dx/n*.45);cameraTarget.set(enemy.x,1.42+enemy.y,enemy.z);break;}
    case 'finish-standoff':desired.set(2.4,1.45,4.4);cameraTarget.set(.0,1.30,0);break;
    case 'finish-prepare0':desired.set(1.8,1.80,.85);cameraTarget.set(-.50,1.50,0);break;
    case 'finish-cut0':desired.set(.45,1.70,3.1);cameraTarget.copy(narrative.parts[0].origin);break;
    case 'finish-prepare1':desired.set(-1.55,1.55,-3.6);cameraTarget.set(.5,1.3,0);break;
    case 'finish-cut1':desired.set(.2,1.58,-3.1);cameraTarget.copy(narrative.parts[1].origin);break;
    case 'finish-prepare2':desired.set(-2.10,1.85,.75);cameraTarget.set(.82,1.85,0);break;
    case 'finish-cut2':desired.set(1.15,1.98,3.5);cameraTarget.copy(narrative.parts[2].origin);break;
    case 'finish-fall':desired.set(1.7,1.25,4.5);cameraTarget.set(.3,.75,0);break;
    case 'finish-body':desired.set(2.5,1.1,2.7);cameraTarget.set(1.2,.32,.5);break;
    case 'finish-face':desired.set(.12,1.96,1.7);cameraTarget.set(-.63,1.91,.05);break;
    case 'finish-pullout':{const u=THREE.MathUtils.smoothstep(state.time,159,165);desired.set(5.5+u*5,3.9+u*24,7.7+u*7);cameraTarget.set(-.5,.9,0);break;}
    case 'pillar-force':desired.set(4.5,3.7,5.6);cameraTarget.copy(pillarState.position).lerp(center,.5);break;
    case 'pillar-chase':desired.copy(pillarState.position).add(new THREE.Vector3(3.3,.85,2.5));cameraTarget.copy(pillarState.position).lerp(new THREE.Vector3(state.fighters[0].x,1.4,state.fighters[0].z),.6);break;
    case 'pillar-cut':desired.set(-4.8,3.05,3.5);cameraTarget.set(-1.8,1.8,.35);break;
    case 'pillar-burst':desired.set(4.5,2.35,3.0);cameraTarget.set(state.fighters[0].x,1.55+state.fighters[0].y,state.fighters[0].z);break;
    case 'knock-guard':desired.set(2.6,2.35,4.9);cameraTarget.set(0,1.4,0);break;
    case 'knock-flight':desired.copy(knockState.position).add(new THREE.Vector3(2.3,1.5,5.5));cameraTarget.copy(knockState.position);break;
    case 'knock-kick':desired.copy(knockState.position).add(new THREE.Vector3(2.3,1.5,4.8));cameraTarget.copy(knockState.position);break;
    case 'knock-counter':desired.set(state.fighters[0].x-1.3,1.85,state.fighters[0].z+.65);cameraTarget.set(state.fighters[1].x,1.4,state.fighters[1].z);break;
    case 'knock-wall':desired.set(-3.35,2.0,3.8);cameraTarget.set(-5.95,1.35,1.05);break;
    case 'orbit':desired.set(Math.cos(time*.58)*7.2,3.3,Math.sin(time*.58)*7.2);cameraTarget.copy(center);break;
    case 'whip':desired.set(Math.cos(time*.65)*7.7,3.1,Math.sin(time*.65)*7.7);cameraTarget.copy(center);break;
    default:desired.set(6.8+Math.sin(time*.07)*.3,4.6,8.8);cameraTarget.set(-1.4,1.1,0);
  }
  if(innerWidth<600){desired.multiplyScalar(1.07);if(!type.startsWith('pillar')&&type!=='ots'){cameraTarget.x=0;cameraTarget.y=1.5;}camera.fov=type==='force'?70:58;}else camera.fov=type.startsWith('pillar')?56:type==='force'?60:type==='ots'?56:type==='close'||type==='lock'?44:38;
  if(innerWidth>=600&&(type.startsWith('transfer-')||type.startsWith('assault-')))camera.fov={'transfer-launch':48,'transfer-flight':62,'transfer-catch':44,'assault-0':48,'assault-1':45,'assault-2':50}[type];
  const targetFov=camera.fov;
  const key=`${cameraMode}/${type}/${state.act}/${state.shot.start}`;
  if(!playing||dt===0||!cameraKey){camera.position.copy(desired);cameraLook.copy(cameraTarget);cameraKey=key;cameraChangeAt=state.time;cameraFrom.copy(desired);lookFrom.copy(cameraTarget);cameraFovFrom=targetFov;}
  else{
    if(key!==cameraKey){cameraFrom.copy(camera.position);lookFrom.copy(cameraLook);cameraChangeAt=state.time;cameraKey=key;cameraFovFrom=previousFov;}
    const duration=type==='ots'||type.startsWith('pillar')||type.startsWith('transfer')?.27:.58,u=Math.min(1,(state.time-cameraChangeAt)/duration),ease=u*u*u*(u*(u*6-15)+10);
    if(u<1){camera.position.copy(cameraFrom).lerp(desired,ease);if(type==='pillar-burst')camera.position.y+=Math.sin(ease*Math.PI)*1.05;cameraLook.copy(lookFrom).lerp(cameraTarget,ease);camera.fov=THREE.MathUtils.lerp(cameraFovFrom,targetFov,ease);}
    else{const alpha=1-Math.exp(-dt*18);camera.position.lerp(desired,alpha);cameraLook.lerp(cameraTarget,alpha);camera.fov=THREE.MathUtils.lerp(previousFov,targetFov,alpha);}
  }
  camera.lookAt(cameraLook);camera.updateProjectionMatrix();
}
function render(){const state=duelState(t),dt=Math.max(0,Math.min(.06,t-renderTime)),moving=dt>0&&playing;renderTime=t;audio.setDramatics(t);if(state.attack.finisher)state.contact=narrative.parts[state.attack.index].origin.toArray();world.update(t);fighters.forEach((f,i)=>{const p=state.fighters[i],prev=poseHistory[i];if(moving&&prev){const a=1-Math.exp(-dt*65);for(const k of ['torsoTwist','hipTurn','lean','crouch'])p[k]=THREE.MathUtils.lerp(prev[k],p[k],a);p.hand=p.hand.map((v,j)=>THREE.MathUtils.lerp(prev.hand[j],v,a));p.offhand=p.offhand.map((v,j)=>THREE.MathUtils.lerp(prev.offhand[j],v,a));}poseHistory[i]={torsoTwist:p.torsoTwist,hipTurn:p.hipTurn,lean:p.lean,crouch:p.crouch,hand:[...p.hand],offhand:[...p.offhand]};f.update(p,state.contact,state.lock,t);});const pillarState=pillar.update(t,moving),knockState=knockback.update(t,moving,state.fighters[0]);
  const story=narrative.update(t,moving);updateCamera(state,pillarState,knockState,dt);$('#scene').dataset.story=story;$('#scene').dataset.transferPhase=transferPhase(t);$('#scene').dataset.flyingSaber=String(narrative.flySword.visible);$('#scene').dataset.flyingSaberHeight=narrative.flightPosition.y.toFixed(3);$('#scene').dataset.assaultStage=state.attack.assault?String(state.attack.assaultStage):'';
  document.body.classList.toggle('combat-close',!cameraMode&&['close','lock','low'].includes(state.shot.type));
  document.body.classList.toggle('intro-complete',t>=4);
  const segments=f=>[...(f.saber.visible?[[f.base,f.tip]]:[]),...(f.rearBlade?.visible?[[f.rearBase,f.rearTip]]:[]),...(f.offhandSaber?.visible?[[f.offhandBase,f.offhandTip]]:[])];
  const candidates=segments(fighters[0]).flatMap(a=>segments(fighters[1]).map(b=>bladeContact(...a,...b))),contact=candidates.sort((a,b)=>a.distance-b.distance)[0]||{distance:99,point:new THREE.Vector3()};const touch=contact.distance<.075&&state.fighters.every(f=>f.ignite>.95)&&!state.attack.finisher;
  const strikeSpeed=dt>0?Math.min(25,fighters[0].tip.distanceTo(previousTips[0])/dt+fighters[1].tip.distanceTo(previousTips[1])/dt):0,impactPower=state.lock?.60:Math.min(1.55,.95+strikeSpeed*.025);
  if(touch&&moving&&(!contacting||t-fx.lastHitTime>.22)&&fx.contact(contact.point,t,impactPower)){fighters[0].recoil(t,impactPower,1);fighters[1].recoil(t,impactPower,-1);audio.clash(impactPower,false,state.lock,THREE.MathUtils.clamp(contact.point.clone().project(camera).x,-.65,.65));hitStop=state.lock?.015:.038;}
  contacting=touch;
  const audioNow=performance.now(),audioDt=Math.max(.001,Math.min(.10,(audioNow-audioFrameAt)/1000));audioFrameAt=audioNow;
  const air=[],activeAirKeys=new Set();const addAir=(key,tip,side)=>{activeAirKeys.add(key);const previous=previousAirTips.get(key),delta=previous?tip.clone().sub(previous):new THREE.Vector3(),speed=moving?delta.length()/audioDt:0,radial=moving?delta.dot(camera.position.clone().sub(tip).normalize())/audioDt:0;air.push({key,speed,radial,side,pan:THREE.MathUtils.clamp(tip.clone().project(camera).x,-.7,.7)});previousAirTips.set(key,tip.clone());};
  fighters.forEach((f,i)=>{if(f.saber.visible&&f.blade.scale.y>.95)addAir(i+'-primary',f.tip,i);if(f.rearBlade?.visible)addAir(i+'-rear',f.rearTip,1);if(f.offhandSaber?.visible)addAir(i+'-offhand',f.offhandTip,1);});
  if(narrative.flySword.visible){const blade=narrative.flySword.getObjectByName('front-blade');addAir('airborne-red',blade.localToWorld(new THREE.Vector3(0,1.25,0)),1);}else previousAirTips.delete('airborne-red');for(const key of previousAirTips.keys())if(!activeAirKeys.has(key))previousAirTips.delete(key);
  const radial=[];const velocities=fighters.map((f,i)=>{const delta=f.tip.clone().sub(previousTips[i]),v=moving?delta.length()/audioDt:0;radial[i]=moving?delta.dot(camera.position.clone().sub(f.tip).normalize())/audioDt:0;previousTips[i].copy(f.tip);return v;});audio.airMotion(air,moving);audio.update(velocities,playing,state.lock&&touch,radial);if(score)score.volume=FILM_MIX.music*audio.musicDuck;fx.update(dt,t,fighters,camera,moving);renderer.info.reset();composer.render();
  $('#scene').dataset.contactGap=contact.distance.toFixed(4);$('#scene').dataset.clashes=fx.hitCount;$('#scene').dataset.soundHits=audio.hitCount;$('#scene').dataset.audioState=audio.ctx?.state||'not initialized';$('#scene').dataset.intent=state.intent;$('#scene').dataset.gripError=Math.max(...fighters.map(f=>f.anatomy.gripError)).toFixed(7);
  $('#scene').dataset.drawCalls=renderer.info.render.calls;$('#scene').dataset.triangles=renderer.info.render.triangles;$('#scene').dataset.geometries=renderer.info.memory.geometries;$('#scene').dataset.textures=renderer.info.memory.textures;$('#scene').dataset.revision=THREE.REVISION;$('#scene').dataset.viewport=`${innerWidth}×${innerHeight}`;$('#scene').dataset.pixelRatio=renderer.getPixelRatio();$('#scene').dataset.tempo=168;
  $('#scene').dataset.score=scoreClock?'Jedi Experiment / onset conform':score?'manual BPM grid':'none';$('#scene').dataset.musicTime=(scoreClock?scoreClock.musicAt(t):score?.currentTime||0).toFixed(3);$('#scene').dataset.scorePlaybackRate=score?.playbackRate||0;$('#scene').dataset.musicPlaying=String(score&&!score.paused);$('#scene').dataset.authoredTime=t.toFixed(3);
  $('#scene').dataset.mixDirection='music-first / authored moment accents';$('#scene').dataset.effectAccent=audio.mix.accent.toFixed(3);$('#scene').dataset.swingLevel=audio.mix.swing.toFixed(3);$('#scene').dataset.contactLevel=audio.mix.clash.toFixed(3);$('#scene').dataset.musicLevel=score?.volume.toFixed(3)||'0';$('#scene').dataset.clashMix='dedicated electrical spark/crackle bus';$('#scene').dataset.clashGain=audio.clashMaster?.gain.value.toFixed(3)||'0';$('#scene').dataset.rainSound=audio.rain?'stereo heavy sheets + close wet patter':'not initialized';$('#scene').dataset.rainSheetGain=audio.rain?.sheet.gain.gain.value.toFixed(3)||'0';$('#scene').dataset.rainPatterGain=audio.rain?.patter.gain.gain.value.toFixed(3)||'0';$('#scene').dataset.swingCount=audio.swingCount;$('#scene').dataset.activeSwings=audio.activeSwings;$('#scene').dataset.swingMix='motion-driven air wroom / separate clash crackle';$('#scene').dataset.musicDuck=audio.musicDuck.toFixed(3);
  $('.title-block h1').innerHTML=t>=161?'The light<br>remains<span>.</span>':'A duel<br>in the ruins<span>.</span>';
  $('#film-ending').style.opacity=THREE.MathUtils.smoothstep(t,164.25,164.99);document.body.classList.toggle('film-ended',t>=164.99);
  $('#chapter-number').textContent=String(state.chapter+1).padStart(2,'0');$('#chapter-name').textContent=knockState.active?'THE GUARD BREAK / PILLAR IMPACT':pillarState.active?'THE PILLAR / FORCE & DEFIANCE':transferPhase(t)?'THE DISARM / SABER TRANSFER':state.attack.assault?'THE RECKONING / ESCALATING ASSAULT':CHAPTERS[state.chapter].name;$('#shot-name').textContent=knockState.active?{guard:'THE OVERHEAD / GUARD BREAK',flight:'KNOCKBACK / LATERAL PURSUIT',wall:'PILLAR COLLAPSE / FOOT BRACE',kick:'PILLAR KICK-OFF / IMMEDIATE RETURN',counter:'NO RESPITE / COUNTERASSAULT'}[knockState.phase]:pillarState.active?{force:'FORCE-LIFT / VILLAIN PORTRAIT',chase:'PILLAR PURSUIT / OBJECT TRACK',burst:'BLUE CUT / THROUGH THE DEBRIS'}[pillarState.phase]:t>=115.7?story:['','IMMERSIVE WIDE','CONTINUOUS ORBIT','GOD’S-EYE VIEW'][cameraMode]||state.shot.name;$('#timeline').value=t;$('#timeline').style.setProperty('--progress',`${t/DURATION*100}%`);$('#current-time').textContent=clockText(scoreClock?scoreClock.musicAt(t):t);return state;}
function animate(now){const dt=Math.min((now-last)/1000,.06);last=now;if(playing){const factor=hitStop>0?.15:1,rate=cinematicRate(t);hitStop=Math.max(0,hitStop-dt);if(score)score.playbackRate=speed;if(scoreClock){silentMusic=score&&!score.paused?score.currentTime:Math.min(scoreCues.duration_seconds,silentMusic+dt*speed);t=scoreClock.authoredAt(silentMusic);}else t=score&&!score.paused&&!score.ended?Math.max(0,(score.currentTime-scoreOffset)*scoreBpm/168):Math.min(DURATION-.001,t+dt*speed*factor*rate);if(t>=DURATION-.001){t=DURATION-.001;setPlaying(false);}}render();const beatPhase=t/(60/168)%1;$('#beat').style.opacity=.5+Math.exp(-beatPhase*8)*.5;frameMs.push(dt*1000);if(frameMs.length>240)frameMs.shift();frames++;if(now-fpsTime>1000){$('#fps').textContent=`${Math.round(frames*1000/(now-fpsTime))} FPS`;frames=0;fpsTime=now;}if(!ready){ready=true;$('#loading').classList.add('loaded');window.__ECLIPSE_READY__=true;}requestAnimationFrame(animate);}
requestAnimationFrame(animate);
function setPlaying(v){playing=v;document.body.classList.toggle('is-paused',!playing);if(score){if(v)score.play().catch(()=>{});else score.pause();}$('#play').setAttribute('aria-label',playing?'Pause duel':'Play duel');$('#play-icon').innerHTML=playing?'<path d="M6 4v12M14 4v12" stroke="currentColor" stroke-width="3"/>':'<path d="m5 3 12 7-12 7Z" fill="currentColor"/>';}
$('#play').onclick=()=>setPlaying(!playing);$('#restart').onclick=()=>{t=0;silentMusic=0;if(score)score.currentTime=Math.max(0,scoreOffset);renderTime=t;fx.clear();setPlaying(true);};$('#timeline').oninput=e=>{t=Math.min(DURATION-.001,Number(e.target.value));silentMusic=scoreClock?scoreClock.musicAt(t):t;if(score)score.currentTime=Math.max(0,scoreClock?silentMusic:t*168/scoreBpm+scoreOffset);renderTime=t;fx.clear();contacting=false;render();};
function seek(v){$('#timeline').value=Math.min(DURATION-.001,Math.max(0,v));$('#timeline').oninput({target:$('#timeline')});}
$('#score-load').onclick=()=>$('#score-file').click();$('#score-file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(score)score.pause();if(scoreUrl)URL.revokeObjectURL(scoreUrl);scoreUrl=URL.createObjectURL(file);score=new Audio(scoreUrl);scoreClock=file.name==='Jedi Experiment.wav'?new ScoreClock(scoreCues.cues):null;score.volume=FILM_MIX.music;score.muted=!audio.enabled;score.playbackRate=speed;silentMusic=scoreClock?scoreClock.musicAt(t):t;score.currentTime=Math.max(0,scoreClock?silentMusic:t*168/scoreBpm+scoreOffset);$('#score-load').textContent='♫ SCORE LINKED';$('#score-load').title=file.name;$('#beat').textContent=scoreClock?'ONSET SYNC':`${scoreBpm} BPM`;$('#total-time').textContent=clockText(scoreClock?scoreCues.duration_seconds:DURATION);if(playing)await score.play().catch(()=>setPlaying(false));};
function manualScore(){scoreClock=null;$('#beat').textContent=`${scoreBpm} BPM`;$('#total-time').textContent=clockText(DURATION);if(score)score.currentTime=Math.max(0,t*168/scoreBpm+scoreOffset);}
$('#score-bpm').onchange=e=>{scoreBpm=Math.max(40,Math.min(240,Number(e.target.value)||168));manualScore();};$('#score-offset').onchange=e=>{scoreOffset=Number(e.target.value)||0;manualScore();};
$('#audio').onclick=async()=>{try{const on=await audio.toggle();if(score){score.muted=!on;if(on&&playing&&score.paused){score.currentTime=scoreClock?scoreClock.musicAt(t):t*168/scoreBpm+scoreOffset;await score.play();}}$('#audio').setAttribute('aria-pressed',String(on));$('#audio').innerHTML=`<span class="control-icon">♫</span> SOUND ${on?'ON':'OFF'}`;}catch{$('#audio').textContent='CLICK TO ENABLE SOUND';}};
const speeds=[1,.25,.5,1.5];$('#speed').onclick=()=>{speed=speeds[(speeds.indexOf(speed)+1)%speeds.length];if(score)score.playbackRate=speed;$('#speed-label').textContent=`${speed}× SPEED`;$('#speed-label').dataset.short=`${speed}×`;};$('#speed-label').dataset.short='1×';
const modes=['DIRECTOR’S CUT','IMMERSIVE WIDE','CONTINUOUS ORBIT','GOD’S-EYE VIEW'];$('#camera').onclick=()=>{cameraMode=(cameraMode+1)%modes.length;$('#camera-label').textContent=modes[cameraMode];};
$('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
$('#report-open').onclick=async()=>{await loadReport();$('#report').showModal();};$('#report-close').onclick=()=>$('#report').close();$('#report').onclick=e=>{if(e.target===$('#report')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
async function loadReport(){try{const [u,m]=await Promise.all([fetch('/progress/usage.json').then(r=>r.json()),fetch('/progress/manifest.json').then(r=>r.json())]);$('#report-stats').innerHTML=`<div class="report-stat"><small>MEASURED TOKENS · INPUT + OUTPUT</small><strong>${u.tokens.total_tokens.toLocaleString()}</strong></div><div class="report-stat"><small>STANDARD API EQUIVALENT · USD</small><strong>$${u.api_equivalent_usd.toFixed(3)}</strong></div><div class="report-stat"><small>DEVELOPMENT · ELAPSED MINUTES</small><strong>${(u.development_time.elapsed_seconds/60).toFixed(1)}</strong></div><div class="report-stat"><small>RENDERER · LATEST STABLE</small><strong>r${THREE.REVISION}</strong></div>`;$('#milestones').replaceChildren();for(const x of m.frames){const row=document.createElement('div');row.className='milestone';const img=document.createElement('img');img.src='/progress/'+x.frame;img.alt=x.stage;const text=document.createElement('div'),label=document.createElement('strong'),small=document.createElement('small');label.textContent=x.stage;small.textContent=`${(x.elapsedSeconds/60).toFixed(1)} min · ${x.tokens.total_tokens.toLocaleString()} tokens · $${x.api_equivalent_usd.toFixed(3)}`;text.append(label,small);row.append(img,text);$('#milestones').append(row);}}catch{$('#report-stats').textContent='The development ledger is being recorded. Check back at the next milestone.';}}
document.addEventListener('keydown',e=>{if(e.target.matches('input,button')||$('#report').open)return;if(e.code==='Space'){e.preventDefault();setPlaying(!playing);}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');if(e.key.toLowerCase()==='c')$('#camera').click();if(e.key.toLowerCase()==='r')$('#restart').click();if(e.key==='ArrowRight')seek(t+1);if(e.key==='ArrowLeft')seek(t-1);});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;});
window.eclipse={seek(v){setPlaying(false);seek(v);},play(){setPlaying(true);},pause(){setPlaying(false);},setCamera(v){cameraMode=v;$('#camera-label').textContent=modes[v];render();},clean(v){document.body.classList.toggle('clean',v);},stats(){const mean=frameMs.reduce((a,b)=>a+b,0)/frameMs.length;return{revision:THREE.REVISION,time:t,playing,speed,cameraMode,meanFrameMs:mean,fps:1000/mean,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,viewport:[innerWidth,innerHeight],pixelRatio:renderer.getPixelRatio(),ready};},snapshot(){return{time:t,chapter:CHAPTERS[duelState(t).chapter].name,shot:$('#shot-name').textContent,fighters:fighters.map(f=>({position:f.root.position.toArray(),base:f.base.toArray(),tip:f.tip.toArray()}))};}};
