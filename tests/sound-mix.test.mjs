import {test} from 'node:test';import assert from 'node:assert/strict';
import {soundMixAt,FILM_MIX,SOUND_ACCENTS} from '../src/sound-mix.js';
import {FINAL_CUTS} from '../src/story-times.js';
import {DuelAudio} from '../src/audio.js';

test('score stays in front while normal air and wire-spark sounds are approximately 12dB lower',()=>{
  const mix=soundMixAt(8);assert.equal(mix.accent,0);assert.equal(mix.music,.86);
  assert.equal(mix.swing,.24);assert.equal(mix.clash,.26);
  assert.ok(20*Math.log10(mix.swing)<-12);assert.ok(20*Math.log10(mix.clash)<-11);
  assert.ok(mix.swingDuck<=.012&&mix.clashDuck<=.018);
});
test('major pillar, disarm and finishing moments get restrained, authored accents',()=>{
  for(const t of [188*60/168,250*60/168,348*60/168,...FINAL_CUTS]){
    const mix=soundMixAt(t);assert.equal(mix.accent,1);assert.equal(mix.swing,FILM_MIX.swingAccent);assert.equal(mix.clash,FILM_MIX.clashAccent);
    assert.ok(mix.swingDuck<=.06&&mix.clashDuck<=.09);assert.equal(mix.music,.86);
  }
});
test('both foley accents are sparse, bounded and smoothly fade back under the score',()=>{
  let strong=0;for(let i=0;i<16500;i++){const m=soundMixAt(i*.01);if(m.accent>.5)strong++;assert.ok(m.accent>=0&&m.accent<=1);assert.ok(m.swing>=.24&&m.swing<=.64);assert.ok(m.clash>=.26&&m.clash<=.70);}
  assert.ok(strong/16500<.15);for(const at of SOUND_ACCENTS){const before=soundMixAt(at-.28),after=soundMixAt(at+.34);assert.ok(Number.isFinite(before.swing)&&Number.isFinite(after.clash));for(const d of [-.28,-.03,.06,.34]){const l=soundMixAt(at+d-.00001),r=soundMixAt(at+d+.00001);assert.ok(Math.abs(l.accent-r.accent)<.001);}}
  assert.equal(soundMixAt(164).accent,0);
});
test('directing audio is seek-safe rather than accumulating loudness from past action',()=>{
  const audio=new DuelAudio();audio.setDramatics(FINAL_CUTS[0]);assert.ok(audio.mix.accent>.99);audio.setDramatics(8);assert.equal(audio.mix.accent,0);assert.deepEqual(audio.mix,soundMixAt(8));audio.setDramatics(FINAL_CUTS[0]);assert.deepEqual(audio.mix,soundMixAt(FINAL_CUTS[0]));
});
test('paused or disabled effects cannot keep the music ducked',()=>{
  const p=()=>({setTargetAtTime(){}}),audio=new DuelAudio();audio.ctx={currentTime:10};audio.lastClash=10;audio.lastClashDuck=.09;audio.lastSwingAt=10;audio.lastSwingDuck=.06;audio.bindGain={gain:p()};audio.rain={sheet:{gain:{gain:p()},filter:{frequency:p()}},patter:{gain:{gain:p()}}};audio.hums=[];
  audio.enabled=true;audio.update([],true);assert.ok(audio.musicDuck>=.91&&audio.musicDuck<1);audio.update([],false);assert.equal(audio.musicDuck,1);audio.enabled=false;audio.update([],true);assert.equal(audio.musicDuck,1);
});
