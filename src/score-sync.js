/** Monotone cubic clock: bends animation time, never the soundtrack's tempo/pitch. */
export class ScoreClock {
  constructor(cues){
    this.cues=cues;
    const delta=cues.slice(1).map((p,i)=>(p.authored-cues[i].authored)/(p.music-cues[i].music));
    this.slopes=cues.map((_,i)=>i===0?delta[0]:i===cues.length-1?delta.at(-1):delta[i-1]*delta[i]<=0?0:2/(1/delta[i-1]+1/delta[i]));
    for(let i=0;i<delta.length;i++){const a=this.slopes[i]/delta[i],b=this.slopes[i+1]/delta[i],norm=Math.hypot(a,b);if(norm>3){this.slopes[i]=3*a/norm*delta[i];this.slopes[i+1]=3*b/norm*delta[i];}}
  }
  authoredAt(music){
    const c=this.cues;if(music<=c[0].music)return c[0].authored;if(music>=c.at(-1).music)return c.at(-1).authored;
    let lo=0,hi=c.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(c[mid].music>music)hi=mid;else lo=mid;}
    const a=c[lo],b=c[hi],h=b.music-a.music,u=(music-a.music)/h;
    return(2*u**3-3*u*u+1)*a.authored+(u**3-2*u*u+u)*h*this.slopes[lo]+(-2*u**3+3*u*u)*b.authored+(u**3-u*u)*h*this.slopes[hi];
  }
  musicAt(authored){let lo=this.cues[0].music,hi=this.cues.at(-1).music;for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(this.authoredAt(mid)<authored)lo=mid;else hi=mid;}return(lo+hi)/2;}
}
