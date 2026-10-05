import cut from './director-cut.json' with {type:'json'};import originalScore from './score-cues.json' with {type:'json'};
import {ScoreClock} from './score-sync.js';import {duelState,IMPACTS,SHOTS} from './choreography.js';
const originalClock=new ScoreClock(originalScore.cues);
export const FILM_DURATION=cut.duration_seconds;
export const FILM_SEGMENTS=cut.segments;
export const FILM_AUDIO=cut.audio;
export function cutAt(time){time=Math.max(0,Math.min(FILM_DURATION-.000001,time));return FILM_SEGMENTS.find(s=>time>=s.start&&time<s.end)||FILM_SEGMENTS.at(-1);}
export function sourceAt(time){if(time>=FILM_DURATION)return 165;const s=cutAt(time);return originalClock.authoredAt(s.musicIn+Math.max(0,time-s.start));}
export function filmAt(source){const s=FILM_SEGMENTS.find(s=>source>=s.sourceIn-1e-8&&source<=s.sourceOut+1e-8);return s?s.start+originalClock.musicAt(source)-s.musicIn:null;}
export function filmState(time){const sourceTime=sourceAt(Math.min(FILM_DURATION-.000001,Math.max(0,time)));return{...duelState(sourceTime),filmTime:time,sourceTime,edit:cutAt(time)};}
export const FILM_IMPACTS=IMPACTS.flatMap(source=>{const at=filmAt(source);return at===null?[]:[{time:at,source}];});
export const FILM_SHOTS=FILM_SEGMENTS.flatMap(s=>[{start:s.start,source:s.sourceIn,type:'editorial-cut',name:s.label},...SHOTS.filter(shot=>shot.start>s.sourceIn&&shot.start<s.sourceOut).map(shot=>({...shot,start:filmAt(shot.start),source:shot.start,name:shot.name.replace(/^ACT \d+ \/ /,'')}))]);
