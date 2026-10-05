# ECLIPSE · A duel in the ruins

A **90-second single-pass director cut** of the procedural Three.js saber duel, with a matching local edit of the supplied Jedi Experiment soundtrack. The original 167.76-second track and legacy animation timing remain intact behind the edit. Developed with **GPT‑6.1 Sol · MAX**. Latest stable Three.js **0.186.1** verified against npm on October 4, 2026 and pinned in the lockfile. Local experiment; not publicly deployed.

## Run

```sh
npm install
npm run dev
```

Preview: http://127.0.0.1:5175/ · evidence: http://127.0.0.1:5175/progress/report.html

For a clean install from the committed lockfile, use `npm ci`. Optional soundtrack re-analysis: `python3 scripts/analyze-score.py /path/to/track.wav` (requires ffmpeg and numpy). The supplied soundtrack, generated analysis and the complete milestone screenshot history are included.

```sh
npm test
npm run verify
npm run build
npm run usage
node scripts/report.mjs
```

## Fight and story

- Twelve committed opening attacks by the light fighter, followed by a twelve-strike dark-side reversal. Later acts intensify and change initiative.
- Fixed-length arm/leg IK, joint flexion limits, foot plants, hip/torso separation, broad cutting arcs, weight transfers and defensive recoils.
- Blue single saber versus red double-ended staff. Front, overhead and behind-back staff spins; alternating blade-end counters.
- A vault over the opponent with tracking turn-around; intentional evasions, dashes and aerial attacks.
- Close blade bind → single backward jumps to opposite platform edges → single leaps back to center, filmed wide and over the shoulder.
- At 1:06.4, a heavy overhead defeats the light fighter’s guard and throws him into a rectangular edge pillar. The impact deforms the stone, spreads cracks and ejects chips; roughly one second of braced recovery precedes the wall kick and return assault.
- At 1:26.4, a Force-lifted broken pillar is thrown at the light fighter. An object-follow camera catches the blue cleave at 1:29.286, then the hero flies through the separated halves toward the camera.
- At 1:55.7, the red staff splits into two sabers. At 2:04.3, a committed upward blade beat sends the red saber into a rotating ballistic arc. The light fighter retreats with deliberate foot plants, frees his left hand and catches the hilt at 2:06.4 (score 2:06.459). Dedicated launch, flight-wide and catch-close coverage makes the transfer readable. He immediately drives forward into 93 alternating blue/red cuts, progressively tightening strike spacing from 0.36 to 0.195 seconds and pushing the dark fighter back before the finishing cuts.
- Three non-graphic metallic severing beats at 2:29.286, 2:31.786 and 2:34.286: dark left arm, right arm, then head. Detached pieces and the fallen stick figure remain visible. Body close-up → captured red saber toss with gravity and damped ground bounces → light fighter face close-up, blue saber extinguish and holster → arms-down, feet-apart stance and final pullout. The authored timeline ends at 2:45, corresponding to score 2:47.760; restart explicitly.

## Rendering

PBR metallic stick figures, clearcoat and millimetre-scale clear water beads/runnels, HDR white-core/colored-corona blades, real planar reflections with distortion, bloom, fog, volumetric-style shafts, timed lightning, beveled masonry courses, damaged arches, rain-interactive rectangular pillars, wet rocks, carved details, weathered floor, dark recessed impact fissures and stone debris. 3,500 GPU rain streaks, 520 ripple instances and 900 splash particles.

Blade/segment intersection, not just an impact timer, triggers melee flash, sparks, point-light pulse, heavy original Web Audio clash, camera recoil and brief hit-stop. The supplied music is the master clock. A monotone cubic time-conform aligns 307 animation landmarks to analyzed transients and selected accents. Music stays at normal speed/pitch through slow motion. Timing is algorithmic and manually selected, not a claim that every hit is perfectly on a downbeat.

## Controls

Space: play/pause · R: restart · C: camera mode · H: hide chrome · arrows: seek one second. Timeline scrub, speed, sound, score loader, fullscreen and experiment log are also available. Intro text disappears after four seconds and returns only while paused; the cost HUD stays visible. Enable sound with a click because browsers restrict autoplay.

The supplied `Jedi Experiment.wav` is linked automatically as a local 256kbps MP3 (5.1MB). Enable sound to hear music and effects. The analysis found competing/variable tempo candidates rather than a reliable steady 168 BPM, so the supplied track uses onset landmarks. Blue cleave: score 1:29.294. Final three cuts: score 2:33.903 / 2:35.032 / 2:36.431. The film ends with the track at 2:47.760.

`public/music-brief.txt` retains the original Suno prompt. **♫ SCORE LINKED** can replace the track; changing BPM/offset in Experiment Log switches to a manual grid. Audio stays local. Analysis and conform are saved in `progress/score-analysis.json` and `progress/score-sync.json`.

## Measurement and evidence

The visible HUD displays measured cumulative tokens, logged active development time and **Standard API-equivalent USD**, not subscription billing. It refreshes from the exact Codex session log every eight seconds while building. Final snapshots live in `progress/usage.json` and `progress/COST.md`; screenshot counters are frozen in `progress/manifest.json`. Reports and screenshots are mirrored into `public/progress` for portable builds.

Pricing verified from [official pricing](https://developers.openai.com/api/docs/pricing): per million short-context tokens, $2 input / $0.10 cached / $2.50 cache writes / $10 output. Above 272K input per request, $4 / $0.20 / $5 / $15. Cached and cache-write input are subsets; reasoning is included in output. The service tier is not recorded, so Standard is explicitly the comparison basis; Fast equivalent is separately 2×. Completed steps only. No subagents, generated image assets or paid runtime APIs. Unexposed tool/review fees are excluded, not assumed free.

## Research and limitations

The choreography adapts coordinated leg-to-arm power and movement sequencing from [fencing-lunge research](https://pmc.ncbi.nlm.nih.gov/articles/PMC7857475/), attack/parry/riposte structure from [FIE rules](https://static.fie.org/uploads/37/185366-technical%20rules%20ang.pdf), and step-in ground-force observations from [Kendo research](https://www.jstage.jst.go.jp/article/budo1968/13/1/13_1/_article/-char/en).

This is stylized procedural animation, **not motion capture or a validated human kinetics model**. Force-enhanced jumps and spins intentionally exaggerate real motion. Fractures are cinematic animation, not stress simulation. Three acts reuse motifs with variations rather than a wholly unique motion-captured performance. Photorealistic-inspired procedural materials are used, not scanned film-grade assets.

## Sound design research

Original procedural layers, no copied film samples: velocity/radial-motion hum, broad rushing swings, electrical contact texture over a restrained low resonant body, and continuous quieter sizzle on actual blade binds. Sound is based on the distinction described by Ben Burtt in the [official swing breakdown](https://www.starwars.com/video/ben-burtt-interview-the-sound-of-lightsabers) and [official clash breakdown](https://www.starwars.com/news/empire-at-40-ben-burtt-interview). A soft attack envelope and compressor reduce clicks and clipping; the score now leads the mix. Ordinary air/contact layers are approximately 12dB below the preceding loud revision, with gentle 1.2%/1.8% music ducking. Selected story beats briefly raise both effects; even these duck the score only up to 6%/9%. This is gain-envelope validation, not calibrated listening-room loudness.

The supporting “wroom” follows actual world-space blade movement (including misses, parries, staff spins and the flying red blade), not collision timing. It layers a swept motor/electrical buzz with air noise. Contact retains its separate electrical crack/sizzle. Heavy rain uses independent stereo sheet and close wet-patter buffers on a separate weather bus, so loud clashes do not compressor-duck the storm. Rain and saber ambience fade when the film is paused or ends.

Electrical contact has a dedicated spark/crackle bus (separate from air whooms and rain), with bright irregular arc bursts and a sustained blade-bind sizzle. Per-bus dynamics and a final effects peak limiter preserve mix headroom.

The music-first director (`src/sound-mix.js`) accents completed barrages, dash collisions, the pillar impact/cleave, disarm/catch, selected accelerating-assault strikes and the final cuts. It uses smooth, narrow, deterministic envelopes. Strong accents occupy under 15% of the authored timeline; neither every swing nor every clash gets promoted. Base score volume is 0.86 (formerly 0.60), with unchanged playback tempo/pitch.


## Reference-driven pacing and defense revision · October 5, 2026

The Opus-labelled segment of [the supplied comparison](https://x.com/DanielZambrini/status/2105756266211729596/video/1) was inspected in the browser as a visual benchmark for broad arcs, readable silhouettes, contact accents and purposeful framing. No reference code or video assets were copied. This is qualitative direction, not a claim that automated tests establish artistic parity.

- **496 authored attack beats / 477 sampled real blade interceptions**, versus 297 / 233 in the first committed build. The opening remains twelve light attacks followed by twelve dark attacks.
- Continuous contact → follow-through → rechamber → accelerating cut curves. Normal combination cadence is approximately 0.21–0.31 seconds per strike; actual score timing stays smooth rather than simply increasing playback speed.
- High/roof, outside/cross-body, low/rising and side parries anticipate the incoming lane, move the hands and torso into the catch, yield on contact and feed two-cut counter interruptions. The dark fighter uses these parries during the final dual-saber assault too.
- **93 alternating-saber assault beats** accelerate from 0.36 to 0.195 seconds per strike. The last three finishing cuts span 2.143 authored seconds, instead of five.
- Force lightning is anchored to the casting hand, intercepted by the blue blade during the volley, and connected to the lifted masonry pillar. Jagged forks, local point lights, water sparkle and illuminated rain/ripples/splashes share the same cue and endpoints.
- The score conform uses a continuous major-cue baseline and onset nudges of at most 25ms. Outside intentional set-piece/ending ramps, sampled clock rates stay approximately 0.745–1.257 authored seconds per music second (previously 0.449–2.705). The soundtrack itself remains at 1×.
- 52 tests pass; 6,600 poses retain fixed bone lengths, anatomical flex limits, grounded feet and attached two-handed grips. GPU/browser verification is recorded separately from offline pose verification.

The on-screen build timer now uses logged active time so the overnight break is not counted as development. Wall elapsed time remains in the full ledger. The preceding commit and original screenshot evidence are retained for comparison.


## Current cut · 90 seconds

This is an editorial removal of redundant material, not a 1.8× playback-speed shortcut. Seven unique sections retain the opening attack/reversal, overhead flank, **one** shared bind-break/backward leap and **one** forward dash, Force volley, pillar impact/recovery, pillar throw/cleave, staff split, readable disarm/catch, advancing two-blade assault, finishing cuts and movie epilogue.

- **279 retained attack beats / 268 sampled real blade contacts**, 34 directed shots including the editorial transitions, and 3,600 inspected film poses.
- Broad cuts chamber in 58ms (formerly 82ms), follow-through recovers in 45ms (formerly 62ms). The shared backward leap is 0.75 seconds and forward dash 0.70; the overhead flips are 0.98 seconds. These are source-animation timings; the retained contact slow-motion remains intact.
- After the catch, **128 retained paired-blade cuts** ramp from roughly **5 to 9 strikes per film second** (source strike gaps tighten from 0.20 to 0.11 seconds). Each sword has its own overlapping follow-through/rechamber channel, dominated by wild reciprocal horizontal sweeps with occasional crossing diagonals—not thrusts or an idle offhand guard. Wrist paths span 0.756m laterally; authored yaw chambers reach ±1.83 radians and the torso coils through both directions. Those are procedural pose parameters, not measured human kinematics. The opposing fighter anticipates and yields into each parry; 70ms effect gating allows the faster real contacts to register.
- Continuous paired-hand poses bypass redundant smoothing, and stance depth is no longer pulsed on every strike. Wider shoulder-pursuit framing keeps both sweeping blades readable.
- Authored pressure paths move the engagement across the wet platform. The final drive advances back toward center instead of holding a stationary sparring stance.
- The source time ranges in `src/director-cut.json` are unique and strictly ordered. Discarded act-two/act-three jump-back/dash sequences cannot play. Hard edit boundaries reset camera, trails, recoil and air-velocity history so skipped material creates no false impacts or giant whooms.
- Default audio: `public/audio/jedi-experiment-90s.mp3`, verified **90.000 seconds**. Original pitch and tempo remain unchanged; 18ms boundary fades avoid edit clicks. The original audio is untouched.
- Current film cues: pillar impact 0:40.371, blue cleave 0:46.818, staff split 0:49.906, disarm 0:52.680, catch 0:54.786, finishing cuts 1:16.143 / 1:17.272 / 1:18.671, discard 1:20.035, blue off 1:22.485, end 1:30.000.
- 62 tests pass, including a sampled full-film assertion that the shared backward leap and forward dash each occur once. Legacy source-regression tests are retained too.

Rebuild the local music edit with `npm run edit:90` (ffmpeg required). The old timing descriptions above document the earlier development iterations; the browser and `progress/verification.json` present the 90-second cut.
