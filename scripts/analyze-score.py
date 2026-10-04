"""Local, reproducible spectral-onset/tempo analysis. No uploads or APIs."""
import argparse, json, pathlib, subprocess
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', help='Local audio file to analyze (requires ffmpeg and numpy)')
source = pathlib.Path(parser.parse_args().source).expanduser()
pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'])
y = np.frombuffer(pcm, dtype='<f4')
sr, hop, n = 22050, 220, 2048
frames = np.lib.stride_tricks.sliding_window_view(y, n)[::hop]
mag = np.abs(np.fft.rfft(frames * np.hanning(n), axis=1))
freq = np.fft.rfftfreq(n, 1 / sr)
positive = np.maximum(0, np.diff(np.log1p(mag * 10), axis=0))
low = positive[:, (freq >= 40) & (freq < 240)].mean(axis=1)
broad = positive[:, (freq >= 240) & (freq < 5500)].mean(axis=1)
onset = .60 * low / max(low.std(), 1e-8) + .40 * broad / max(broad.std(), 1e-8)
onset = np.convolve(onset, [0.2, 0.6, 0.2], mode='same')
times = (np.arange(len(onset)) * hop + n / 2) / sr
duration = len(y) / sr
active = (times >= 18) & (times < duration - 18)
env = np.maximum(0, onset[active] - np.percentile(onset[active], 60))
tt = times[active]
tempos = np.arange(80, 201, .025)
coherence = np.array([abs(np.sum(env * np.exp(-2j * np.pi * bpm / 60 * tt))) for bpm in tempos])
peaks = np.where((coherence[1:-1] > coherence[:-2]) & (coherence[1:-1] > coherence[2:]))[0] + 1
ranked = sorted(peaks, key=lambda i: coherence[i], reverse=True)[:10]
bpm = float(tempos[ranked[0]])
beat = 60 / bpm
phase = float((-np.angle(np.sum(env * np.exp(-2j * np.pi * bpm / 60 * tt))) / (2 * np.pi) * beat) % beat)
onset_peaks = np.where((onset[1:-1] > onset[:-2]) & (onset[1:-1] > onset[2:]))[0] + 1
strong = onset_peaks[onset[onset_peaks] > np.percentile(onset, 80)]
beats = []
for center in np.arange(phase, duration, beat):
    window = np.where(abs(times - center) < .055)[0]
    i = window[np.argmax(onset[window])] if len(window) else np.argmin(abs(times - center))
    beats.append({'time': round(float(times[i]), 4), 'strength': round(float(onset[i]), 4), 'grid': round(float(center), 4)})
sections = []
for start in range(0, int(duration), 8):
    signal = y[start*sr:min((start+8)*sr, len(y))]
    sections.append({'start': start, 'rms_db': round(float(20*np.log10(max(np.sqrt(np.mean(signal**2)), 1e-9))), 2)})
report = {'source': source.name, 'duration_seconds': duration, 'estimated_bpm': round(bpm, 3),
          'beat_phase_seconds': round(phase, 4), 'method': 'Local spectral flux, 40–240Hz / 240–5500Hz; periodic phase coherence over the active middle. Algorithmic estimate, not a manual transcription.',
          'tempo_candidates': [{'bpm': round(float(tempos[i]), 3), 'coherence': round(float(coherence[i]), 2)} for i in ranked],
          'beats': beats, 'sections': sections,
          'strong_onsets': [{'time': round(float(times[i]), 4), 'strength': round(float(onset[i]), 4)} for i in strong]}
for directory in ['progress', 'public/progress']:
    (root / directory / 'score-analysis.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['beats', 'strong_onsets']}, indent=2))
print('Final onsets:', [x for x in report['strong_onsets'] if x['time'] > 140])
