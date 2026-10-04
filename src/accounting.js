export const PRICE_SOURCE='https://developers.openai.com/api/docs/pricing';
export const PRICE_VERIFIED='2026-10-04';
export const COUNTERS=['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens','total_tokens'];
/** Standard API-equivalent prices per million tokens. Cached/write tokens are subsets. */
export function priceStep(tokens,promptTokens=0,multiplier=1){
  const long=promptTokens>272000,r=long?{input:4,cached:.2,write:5,output:15}:{input:2,cached:.1,write:2.5,output:10};
  const uncached=Math.max(0,(tokens.input_tokens||0)-(tokens.cached_input_tokens||0)-(tokens.cache_write_input_tokens||0));
  const breakdown={uncached_input_usd:uncached*r.input/1e6*multiplier,cached_input_usd:(tokens.cached_input_tokens||0)*r.cached/1e6*multiplier,cache_write_usd:(tokens.cache_write_input_tokens||0)*r.write/1e6*multiplier,output_usd:(tokens.output_tokens||0)*r.output/1e6*multiplier};
  return{uncached_input_tokens:uncached,context_tier:long?'long':'short',...breakdown,api_equivalent_usd:Object.values(breakdown).reduce((a,b)=>a+b,0)};
}
export function parseUsage(rows){
  let previous={},latest,model,effort,tier;const steps=[];
  for(const row of rows){
    if(row.type==='turn_context'){model=row.payload.model;effort=row.payload.effort;tier=row.payload.service_tier;}
    if(row.type!=='event_msg'||row.payload?.type!=='token_count'||!row.payload.info?.total_token_usage)continue;
    const info=row.payload.info,total=info.total_token_usage,delta={};for(const k of COUNTERS)delta[k]=Math.max(0,(total[k]||0)-(previous[k]||0));previous=total;latest={timestamp:row.timestamp,total};
    if(!delta.input_tokens&&!delta.output_tokens)continue;
    steps.push({at:row.timestamp,...delta,...priceStep(delta,info.last_token_usage?.input_tokens||delta.input_tokens)});
  }
  return{model,reasoning_effort:effort,recorded_service_tier:tier??'not recorded',usage_as_of:latest?.timestamp,tokens:latest?.total||Object.fromEntries(COUNTERS.map(k=>[k,0])),steps,api_equivalent_usd:steps.reduce((s,x)=>s+x.api_equivalent_usd,0)};
}
export function developmentTime(rows,asOf){
  const meta=rows.find(x=>x.type==='session_meta'),start=meta?.payload.timestamp||meta?.timestamp;
  const intervals=[];let activeStart;
  for(const row of rows){if(row.type!=='event_msg')continue;const kind=row.payload?.type;if(kind==='task_started'&&!activeStart)activeStart=row.timestamp;if(['task_complete','turn_aborted'].includes(kind)&&activeStart){intervals.push([activeStart,row.timestamp]);activeStart=null;}}
  if(activeStart)intervals.push([activeStart,asOf]);
  const elapsed=(new Date(asOf)-new Date(start))/1000,active=intervals.reduce((s,[a,b])=>s+(new Date(b)-new Date(a))/1000,0);
  return{started_at:start,as_of:asOf,elapsed_seconds:elapsed,active_seconds:active||elapsed,idle_seconds:active?Math.max(0,elapsed-active):0,method:'Wall time from this experiment session start; active intervals use task_started/task_complete events. Tool waits are development time, not excluded. No human labor time inferred.'};
}
