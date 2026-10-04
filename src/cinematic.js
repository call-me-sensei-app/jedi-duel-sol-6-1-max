import {smooth,BEAT} from './choreography.js';
export const FINAL_CUTS=[418*BEAT,425*BEAT,432*BEAT];
/** Speed ramps slow the spectacle, not the attack's authored physical arc. */
export function cinematicRate(t){
  const windows=[{a:67.06,b:67.25,rate:.35},{a:88.94,b:89.32,rate:.24},...FINAL_CUTS.map(c=>({a:c-.10,b:c+.16,rate:.20}))];
  for(const w of windows){if(t>=w.a-.12&&t<=w.b+.12){const into=smooth((t-w.a+.12)/.12),out=smooth((w.b+.12-t)/.12),strength=Math.min(into,out);return 1-strength*(1-w.rate);}}
  return 1;
}
export function finalCameraStage(t){if(t>=159.0)return'pullout';if(t>=157.5)return'face';if(t>=155.35)return'body';if(t<FINAL_CUTS[0]-.55)return'standoff';const i=FINAL_CUTS.findIndex(c=>t<=c+.50);if(i<0)return'fall';return t<FINAL_CUTS[i]-.18?'prepare'+i:'cut'+i;}
