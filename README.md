# ECLIPSE · A duel in the ruins

A three-act procedural Three.js saber duel: 165 seconds of authored animation conformed to the supplied **167.76-second Jedi Experiment** soundtrack. Developed with **GPT‑6.1 Sol · MAX**. Latest stable Three.js **0.186.1** verified against npm on October 4, 2026 and pinned in the lockfile. Local experiment; not publicly deployed.

## Run

```sh
npm install
npm run dev
```

Preview: http://127.0.0.1:5175/ · evidence: http://127.0.0.1:5175/progress/report.html

For a clean install from the committed lockfile, use `npm ci`. Optional soundtrack re-analysis: `python3 scripts/analyze-score.py /path/to/track.wav` (requires ffmpeg and numpy). The supplied soundtrack, generated analysis and all nineteen milestone screenshots are included.

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
- At 1:55.7, the red staff splits into two sabers. At 2:04.3, a committed upward blade beat sends the red saber into a rotating ballistic arc. The light fighter retreats with deliberate foot plants, frees his left hand and catches the hilt at 2:06.4 (score 2:06.459). Dedicated launch, flight-wide and catch-close coverage makes the transfer readable. He immediately drives forward into 67 alternating blue/red cuts, progressively tightening strike spacing from 0.46 to 0.235 seconds and pushing the dark fighter back before the finishing cuts.
- Three non-graphic metallic severing beats at 2:29.286, 2:31.786 and 2:34.286: dark left arm, right arm, then head. Detached pieces and the fallen stick figure remain visible. Body close-up → captured red saber toss with gravity and damped ground bounces → light fighter face close-up, blue saber extinguish and holster → arms-down, feet-apart stance and final pullout. The authored timeline ends at 2:45, corresponding to score 2:47.760; restart explicitly.

## Rendering

PBR metallic stick figures, clearcoat and millimetre-scale clear water beads/runnels, HDR white-core/colored-corona blades, real planar reflections with distortion, bloom, fog, volumetric-style shafts, timed lightning, beveled masonry courses, damaged arches, rain-interactive rectangular pillars, wet rocks, carved details, weathered floor, dark recessed impact fissures and stone debris. 3,500 GPU rain streaks, 520 ripple instances and 900 splash particles.

Blade/segment intersection, not just an impact timer, triggers melee flash, sparks, point-light pulse, heavy original Web Audio clash, camera recoil and brief hit-stop. The supplied music is the master clock. A monotone cubic time-conform aligns 307 animation landmarks to analyzed transients and selected accents. Music stays at normal speed/pitch through slow motion. Timing is algorithmic and manually selected, not a claim that every hit is perfectly on a downbeat.

## Controls

Space: play/pause · R: restart · C: camera mode · H: hide chrome · arrows: seek one second. Timeline scrub, speed, sound, score loader, fullscreen and experiment log are also available. Intro text disappears after four seconds and returns only while paused; the cost HUD stays visible. Enable sound with a click because browsers restrict autoplay.

The supplied `Jedi Experiment.wav` is linked automatically as a local 256kbps MP3 (5.1MB). Enable sound to hear music and effects. The analysis found competing/variable tempo candidates rather than a reliable steady 168 BPM, so the supplied track uses onset landmarks. Blue cleave: score 1:29.294. Final three cuts: score 2:30.026 / 2:33.677 / 2:36.431. The film ends with the track at 2:47.760.

`public/music-brief.txt` retains the original Suno prompt. **♫ SCORE LINKED** can replace the track; changing BPM/offset in Experiment Log switches to a manual grid. Audio stays local. Analysis and conform are saved in `progress/score-analysis.json` and `progress/score-sync.json`.

## Measurement and evidence

The visible HUD displays measured cumulative tokens, elapsed development time and **Standard API-equivalent USD**, not subscription billing. It refreshes from the exact Codex session log every eight seconds while building. Final snapshots live in `progress/usage.json` and `progress/COST.md`; screenshot counters are frozen in `progress/manifest.json`. Reports and screenshots are mirrored into `public/progress` for portable builds.

Pricing verified from [official pricing](https://developers.openai.com/api/docs/pricing): per million short-context tokens, $2 input / $0.10 cached / $2.50 cache writes / $10 output. Above 272K input per request, $4 / $0.20 / $5 / $15. Cached and cache-write input are subsets; reasoning is included in output. The service tier is not recorded, so Standard is explicitly the comparison basis; Fast equivalent is separately 2×. Completed steps only. No subagents, generated image assets or paid runtime APIs. Unexposed tool/review fees are excluded, not assumed free.

## Research and limitations

The choreography adapts coordinated leg-to-arm power and movement sequencing from [fencing-lunge research](https://pmc.ncbi.nlm.nih.gov/articles/PMC7857475/), attack/parry/riposte structure from [FIE rules](https://static.fie.org/uploads/37/185366-technical%20rules%20ang.pdf), and step-in ground-force observations from [Kendo research](https://www.jstage.jst.go.jp/article/budo1968/13/1/13_1/_article/-char/en).

This is stylized procedural animation, **not motion capture or a validated human kinetics model**. Force-enhanced jumps and spins intentionally exaggerate real motion. Fractures are cinematic animation, not stress simulation. Three acts reuse motifs with variations rather than a wholly unique motion-captured performance. Photorealistic-inspired procedural materials are used, not scanned film-grade assets.

## Sound design research

Original procedural layers, no copied film samples: velocity/radial-motion hum, broad rushing swings, electrical contact texture over a restrained low resonant body, and continuous quieter sizzle on actual blade binds. Sound is based on the distinction described by Ben Burtt in the [official swing breakdown](https://www.starwars.com/video/ben-burtt-interview-the-sound-of-lightsabers) and [official clash breakdown](https://www.starwars.com/news/empire-at-40-ben-burtt-interview). A soft attack envelope and compressor reduce clicks and clipping; the score now leads the mix. Ordinary air/contact layers are approximately 12dB below the preceding loud revision, with gentle 1.2%/1.8% music ducking. Selected story beats briefly raise both effects; even these duck the score only up to 6%/9%. This is gain-envelope validation, not calibrated listening-room loudness.

The supporting “wroom” follows actual world-space blade movement (including misses, parries, staff spins and the flying red blade), not collision timing. It layers a swept motor/electrical buzz with air noise. Contact retains its separate electrical crack/sizzle. Heavy rain uses independent stereo sheet and close wet-patter buffers on a separate weather bus, so loud clashes do not compressor-duck the storm. Rain and saber ambience fade when the film is paused or ends.

Electrical contact has a dedicated spark/crackle bus (separate from air whooms and rain), with bright irregular arc bursts and a sustained blade-bind sizzle. Per-bus dynamics and a final effects peak limiter preserve mix headroom.

The music-first director (`src/sound-mix.js`) accents completed barrages, dash collisions, the pillar impact/cleave, disarm/catch, selected accelerating-assault strikes and the final cuts. It uses smooth, narrow, deterministic envelopes. Strong accents occupy under 15% of the authored timeline; neither every swing nor every clash gets promoted. Base score volume is 0.86 (formerly 0.60), with unchanged playback tempo/pitch.
