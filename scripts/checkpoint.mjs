import fs from 'node:fs';import path from 'node:path';import {refreshUsage,root} from './usage.mjs';
const [frame,stage]=process.argv.slice(2);if(!frame||!stage)throw Error('Usage: npm run checkpoint -- 001-name.jpg "Milestone title"');
if(path.basename(frame)!==frame||!frame.endsWith('.jpg'))throw Error('Expected local JPG basename');
const r=refreshUsage(),file=path.join(root,'progress',frame);if(!fs.existsSync(file))throw Error('Capture the actual browser screenshot before marking the milestone.');
const manifestPath=path.join(root,'progress','manifest.json');const m=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{experiment:'ECLIPSE / 003',startedAt:r.development_time.started_at,frames:[]};
if(m.frames.some(x=>x.frame===frame))throw Error('Milestone already recorded; do not replace historical evidence.');
m.frames.push({stage,frame,capturedAt:new Date().toISOString(),elapsedSeconds:r.development_time.elapsed_seconds,tokenUsageAsOf:r.usage_as_of,tokens:r.tokens,api_equivalent_usd:r.api_equivalent_usd});
fs.writeFileSync(manifestPath,JSON.stringify(m,null,2)+'\n');fs.copyFileSync(file,path.join(root,'public/progress',frame));fs.copyFileSync(manifestPath,path.join(root,'public/progress','manifest.json'));console.log(JSON.stringify(m.frames.at(-1)));
