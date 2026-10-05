import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {ScoreClock} from '../src/score-sync.js';
const score=JSON.parse(fs.readFileSync('src/score-cues.json')),clock=new ScoreClock(score.cues),duration=90;
const ranges=[
  [0,8.35,'OPENING / ATTACK & ANSWER'],
  [11.35,41.80,'FLANK / ONE BIND-BREAK & DASH'],
  [65.60,70.40,'PILLAR IMPACT / RECOVERY & RETURN'],
  [86.10,92.30,'FORCE PILLAR / CLEAVE & PURSUIT'],
  [115.66,117.80,'STAFF SPLIT / TWO-BLADE COUNTER'],
  [123.55,137.0,'DISARM / CATCH & ADVANCING ASSAULT'],
];
let cursor=0;const segments=ranges.map(([sourceIn,sourceOut,label],index)=>{const musicIn=clock.musicAt(sourceIn),musicOut=clock.musicAt(sourceOut),length=musicOut-musicIn,s={index,label,sourceIn,sourceOut,musicIn,musicOut,start:cursor,end:cursor+length};cursor+=length;return s;});
const musicOut=score.duration_seconds,musicIn=musicOut-(duration-cursor);segments.push({index:segments.length,label:'FINAL DRIVE / THREE CUTS & EPILOGUE',sourceIn:clock.authoredAt(musicIn),sourceOut:165,musicIn,musicOut,start:cursor,end:duration});
const report={duration_seconds:duration,cues:[{authored:0,music:0},{authored:duration,music:duration}],source_duration_seconds:165,source_music_duration_seconds:score.duration_seconds,audio:'/audio/jedi-experiment-90s.mp3',method:'Single-pass editorial cut; discarded repeated acts and stationary exchanges. Music clips retain their original pitch and tempo. 18ms edge fades prevent edit clicks; no repeated jump-back/dash segment.',segments};
for(const p of ['src/director-cut.json','progress/director-cut.json','public/progress/director-cut.json'])fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');
const filters=segments.map((s,i)=>`[0:a]atrim=start=${s.musicIn.toFixed(8)}:end=${s.musicOut.toFixed(8)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.018,afade=t=out:st=${(s.end-s.start-.018).toFixed(8)}:d=0.018[a${i}]`);
filters.push(segments.map((_,i)=>`[a${i}]`).join('')+`concat=n=${segments.length}:v=0:a=1[out]`);
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-i','public/audio/jedi-experiment.mp3','-filter_complex',filters.join(';'),'-map','[out]','-t','90','-codec:a','libmp3lame','-b:a','256k','public/audio/jedi-experiment-90s.mp3'],{stdio:'inherit'});
console.log(JSON.stringify({duration,segments:segments.map(s=>({label:s.label,start:s.start,end:s.end,sourceIn:s.sourceIn,sourceOut:s.sourceOut}))},null,2));
