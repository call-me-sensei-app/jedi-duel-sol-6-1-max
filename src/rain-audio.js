export const RAIN_MIX=Object.freeze({sheet:.38,patter:.52});
/** Original stereo storm textures: broad sheets plus hundreds of close wet impacts. */
export function rainBuffers(ctx){
  const length=Math.round(ctx.sampleRate*4.73),sheets=ctx.createBuffer(2,length,ctx.sampleRate),patter=ctx.createBuffer(2,length,ctx.sampleRate);
  for(let channel=0;channel<2;channel++){
    let seed=148447+channel*73159;const rnd=()=>{seed=seed*16807%2147483647;return seed/2147483647;},bed=sheets.getChannelData(channel),drops=patter.getChannelData(channel);
    for(let i=0;i<length;i++)bed[i]=(rnd()*2-1)*.68;
    for(let event=0;event<Math.floor(4.73*260);event++){
      const start=Math.floor(rnd()*(length-ctx.sampleRate*.035)),n=Math.max(3,Math.floor(ctx.sampleRate*(.004+rnd()*.014))),frequency=1200+rnd()*3100,strength=.26+rnd()*.38;
      for(let j=0;j<n;j++)drops[start+j]+=((rnd()*2-1)*.82+Math.sin(j/ctx.sampleRate*frequency*Math.PI*2)*.18)*Math.exp(-j/(n*.19))*strength;
    }
    const peak=drops.reduce((p,v)=>Math.max(p,Math.abs(v)),0),scale=.85/Math.max(.85,peak);for(let i=0;i<length;i++)drops[i]*=scale;
  }
  return{sheets,patter};
}
