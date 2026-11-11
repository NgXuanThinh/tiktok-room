// Web Audio API procedural sound effects synthesizer for Preview Studio

let previewAudioCtx = null;

export function getPreviewAudioCtx() {
  if (!previewAudioCtx && (window.AudioContext || window.webkitAudioContext)) {
    previewAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (previewAudioCtx && previewAudioCtx.state === 'suspended') {
    previewAudioCtx.resume();
  }
  return previewAudioCtx;
}

export function playPreviewSfx(type) {
  try {
    const ctx = getPreviewAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } else if (type === 'bassBoom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.55);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.85);
    } else if (type === 'goldChime') {
      const freqs = [1567.98, 2093.00, 2637.02, 3135.96]; // G6, C7, E7, G7
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.06);
        gain.gain.setValueAtTime(0.20, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 1.4);
      });
    } else if (type === 'swordClash') {
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(500, t + 0.32);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.38, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);

      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, t);
      popGain.gain.setValueAtTime(0.32, t);
      popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(popGain);
      popGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } else if (type === 'royalFanfare') {
      const notes = [
        { f: 523.25, time: 0.0, dur: 0.22 }, // C5
        { f: 659.25, time: 0.2, dur: 0.22 }, // E5
        { f: 783.99, time: 0.4, dur: 0.30 }, // G5
        { f: 1046.50, time: 0.65, dur: 1.4 }  // C6
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, t + n.time);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(n.f * 3.5, t + n.time);
        gain.gain.setValueAtTime(0.24, t + n.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.time + n.dur);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + n.time);
        osc.stop(t + n.time + n.dur);
      });
    } else if (type === 'heartSwoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    }
  } catch (err) {
    console.warn('Preview audio error:', err);
  }
}
