import {ASSAULT_BEATS,TRANSFER} from './weapon-transfer.js';
import {FINAL_CUTS} from './story-times.js';

/** Music leads. Foley accents are authored story beats, never a random volume lottery. */
export const FILM_MIX=Object.freeze({music:.86,swingBed:.24,swingAccent:.64,clashBed:.26,clashAccent:.70,swingDuckBed:.012,swingDuckAccent:.06,clashDuckBed:.018,clashDuckAccent:.09});
const beat=60/168;
export const SOUND_ACCENTS=Object.freeze([
  ...[0,48,96].flatMap(act=>[16*beat,29*beat,16.0,26.3,37.5,47.5].map(t=>t+act)).filter(t=>t<TRANSFER.prepare),
  186*beat,188*beat,250*beat,324*beat,TRANSFER.launch,TRANSFER.catch,
  ...[0,18,39,57,ASSAULT_BEATS.length-1].map(i=>ASSAULT_BEATS[i]),...FINAL_CUTS,
].sort((a,b)=>a-b));
const smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
export function soundMixAt(t){
  let accent=0;
  for(const at of SOUND_ACCENTS){const d=t-at;accent=Math.max(accent,d<0?smooth((d+.28)/.25):1-smooth((d-.06)/.28));}
  const blend=(bed,peak)=>bed+(peak-bed)*accent;
  return{accent,music:FILM_MIX.music,swing:blend(FILM_MIX.swingBed,FILM_MIX.swingAccent),clash:blend(FILM_MIX.clashBed,FILM_MIX.clashAccent),swingDuck:blend(FILM_MIX.swingDuckBed,FILM_MIX.swingDuckAccent),clashDuck:blend(FILM_MIX.clashDuckBed,FILM_MIX.clashDuckAccent)};
}
