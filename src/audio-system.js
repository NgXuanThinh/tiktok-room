// src/audio-system.js - 3-band FFT spectrum analyzer, DJ audio player, procedural SFX, and 128 BPM EDM synth

/**
 * Splits frequency spectrum into Bass (0-150Hz), Mids (150-1000Hz), and Treble (>1000Hz).
 * @param {Uint8Array} spectrum - Frequency bins array from AnalyserNode
 * @param {number} sampleRate - Audio context sample rate (default 44100)
 * @param {number} fftSize - AnalyserNode FFT size (default 512)
 * @returns {object} { bassEnergy, midsEnergy, trebleEnergy, bassEnd, midsEnd, totalEnergy }
 */
export function split3BandFrequency(spectrum, sampleRate = 44100, fftSize = 512) {
  if (!spectrum || spectrum.length === 0) {
    return { bassEnergy: 0, midsEnergy: 0, trebleEnergy: 0, bassEnd: 1, midsEnd: 11, totalEnergy: 0 };
  }

  const binWidth = sampleRate / fftSize; // ~86.13 Hz per bin
  const bassEnd = Math.max(1, Math.floor(150 / binWidth)); // Bins 0-1
  const midsStart = bassEnd + 1;
  const midsEnd = Math.max(midsStart + 1, Math.floor(1000 / binWidth)); // Bins 2-11
  const trebleStart = midsEnd + 1;
  const trebleEnd = spectrum.length - 1;

  let bassSum = 0;
  for (let i = 0; i <= bassEnd; i++) {
    bassSum += spectrum[i] || 0;
  }
  const bassEnergy = bassSum / (bassEnd + 1);

  let midsSum = 0;
  const midsCount = Math.max(1, midsEnd - midsStart + 1);
  for (let i = midsStart; i <= midsEnd; i++) {
    midsSum += spectrum[i] || 0;
  }
  const midsEnergy = midsSum / midsCount;

  let trebleSum = 0;
  const trebleCount = Math.max(1, trebleEnd - trebleStart + 1);
  for (let i = trebleStart; i <= trebleEnd; i++) {
    trebleSum += spectrum[i] || 0;
  }
  const trebleEnergy = trebleSum / trebleCount;

  return {
    bassEnergy,
    midsEnergy,
    trebleEnergy,
    bassEnd,
    midsEnd,
    totalEnergy: (bassEnergy + midsEnergy + trebleEnergy) / 3
  };
}

/**
 * Calculates audio transient flux using smoothed running average.
 */
export function calculateAudioFlux(current, avg, smoothing = 0.85) {
  const newAvg = smoothing * avg + (1 - smoothing) * current;
  const flux = Math.max(0, current - newAvg);
  return { flux, newAvg };
}

/**
 * Zero-dependency procedural sound synthesizers configuration.
 */
export const SFX_CONFIGS = {
  coin: {
    type: 'sine',
    frequencies: [1318, 1567],
    freq1: 1318,
    freq2: 1567,
    duration: 0.12,
    decayTarget: 0.0001
  },
  airhorn: {
    type: 'sawtooth',
    pitchRampStart: 880,
    pitchRampEnd: 1760,
    duration: 0.5,
    decayTarget: 0.0001
  },
  boom: {
    type: 'noise',
    lowPassCutoff: 40,
    duration: 0.8,
    decayTarget: 0.0001
  }
};

export function synthesizeSfxParams(name) {
  return SFX_CONFIGS[name] || SFX_CONFIGS.coin;
}

/**
 * 128 BPM Procedural Drum Sequencer Loop Configuration.
 */
export const BEAT_LOOP_CONFIG = {
  bpm: 128,
  secondsPerBeat: 60 / 128, // 0.46875s
  stepDuration: (60 / 128) / 4, // 0.1171875s (16th note)
  kick: {
    startFreq: 130,
    endFreq: 45,
    decaySeconds: 0.12
  },
  snare: {
    filterType: 'bandpass',
    centerFreq: 1200,
    q: 2.0,
    decaySeconds: 0.15
  },
  hihat: {
    filterType: 'highpass',
    cutoffFreq: 7000,
    decaySeconds: 0.05
  }
};

/**
 * Resolves active drum triggers for a 16-step sequencer pattern.
 * @param {number} step - Step index 0 to 15
 * @returns {object} { kick, snare, hihat, step }
 */
export function getBeatStepEvents(step) {
  const s = ((Math.floor(step) % 16) + 16) % 16;
  const isQuarter = s % 4 === 0;
  const isKick = isQuarter; // Four on the floor: 0, 4, 8, 12
  const isSnare = s === 4 || s === 12; // Backbeat on 4, 12
  const isHiHat = s === 2 || s === 6 || s === 10 || s === 14; // 8th note off-beats

  return {
    step: s,
    kick: isKick,
    snare: isSnare,
    hihat: isHiHat
  };
}

/**
 * Built-in 16-Step Procedural 128 BPM EDM Synthesizer Engine.
 * Operates without external MP3 files and feeds directly into AnalyserNode.
 */
export class ProceduralBeatEngine {
  constructor(audioCtx = null, destinationNode = null) {
    this.ctx = audioCtx;
    this.destination = destinationNode;
    this.isPlaying = false;
    this.currentStep = 0;
    this.timerId = null;
    this.volume = 0.8;
    this.masterGain = null;
  }

  start(audioCtx = this.ctx, destinationNode = this.destination) {
    this.ctx = audioCtx || this.ctx;
    this.destination = destinationNode || this.destination;
    this.isPlaying = true;
    this.currentStep = 0;

    if (this.ctx && this.destination && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.destination);
    }

    if (this.timerId) clearInterval(this.timerId);
    const stepMs = Math.round(BEAT_LOOP_CONFIG.stepDuration * 1000);
    this.timerId = setInterval(() => {
      if (!this.isPlaying) return;
      this._playStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepMs);
  }

  _playStep(step) {
    if (!this.ctx || this.ctx.state !== 'running' || !this.masterGain) return;
    const events = getBeatStepEvents(step);
    const t = this.ctx.currentTime;

    // Kick drum (pitch-swept sine)
    if (events.kick) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(BEAT_LOOP_CONFIG.kick.startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(BEAT_LOOP_CONFIG.kick.endFreq, t + BEAT_LOOP_CONFIG.kick.decaySeconds);

      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + BEAT_LOOP_CONFIG.kick.decaySeconds);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + BEAT_LOOP_CONFIG.kick.decaySeconds);
    }

    // Snare / Clap (bandpass noise)
    if (events.snare) {
      const dur = BEAT_LOOP_CONFIG.snare.decaySeconds;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(BEAT_LOOP_CONFIG.snare.centerFreq, t);
      filter.Q.setValueAtTime(BEAT_LOOP_CONFIG.snare.q, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + dur);
    }

    // Hi-Hat (highpass noise)
    if (events.hihat) {
      const dur = BEAT_LOOP_CONFIG.hihat.decaySeconds;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(BEAT_LOOP_CONFIG.hihat.cutoffFreq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + dur);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
}

/**
 * Top-level helper function to unlock browser audio safely on user gesture.
 */
export async function unlockAudio(instance = null) {
  if (instance && typeof instance.unlockAudio === 'function') {
    return instance.unlockAudio();
  }
  return true;
}

/**
 * Audio System Manager running in browser with Web Audio API.
 */
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.gainNode = null;
    this.beatEngine = new ProceduralBeatEngine();
    this.spectrum = new Uint8Array(256);
    this.bassAvg = 50;
    this.midsAvg = 50;
    this.trebleAvg = 50;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.8;

    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  async unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.beatEngine && !this.beatEngine.isPlaying) {
      this.beatEngine.start(this.ctx, this.gainNode);
    }
    return true;
  }

  getBands() {
    if (!this.analyser) {
      return { bass: 0, mids: 0, treble: 0, bassFlux: 0, midsFlux: 0, trebleFlux: 0 };
    }

    this.analyser.getByteFrequencyData(this.spectrum);
    const bands = split3BandFrequency(this.spectrum, this.ctx.sampleRate, this.analyser.fftSize);

    const bassRes = calculateAudioFlux(bands.bassEnergy, this.bassAvg);
    this.bassAvg = bassRes.newAvg;

    const midsRes = calculateAudioFlux(bands.midsEnergy, this.midsAvg);
    this.midsAvg = midsRes.newAvg;

    const trebRes = calculateAudioFlux(bands.trebleEnergy, this.trebleAvg);
    this.trebleAvg = trebRes.newAvg;

    return {
      bass: bands.bassEnergy,
      mids: bands.midsEnergy,
      treble: bands.trebleEnergy,
      bassFlux: bassRes.flux,
      midsFlux: midsRes.flux,
      trebleFlux: trebRes.flux
    };
  }

  playSfx(name) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const config = synthesizeSfxParams(name);

    if (config.type === 'sine' && config.frequencies) {
      for (const freq of config.frequencies) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(config.decayTarget, t + config.duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + config.duration);
      }
    } else if (config.type === 'sawtooth') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(config.pitchRampStart, t);
      osc.frequency.exponentialRampToValueAtTime(config.pitchRampEnd, t + config.duration * 0.7);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(config.decayTarget, t + config.duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + config.duration);
    } else if (config.type === 'noise') {
      const bufferSize = this.ctx.sampleRate * config.duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(config.lowPassCutoff, t + config.duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(config.decayTarget, t + config.duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + config.duration);
    }
  }

  setVolume(val) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, val));
    }
    if (this.beatEngine) {
      this.beatEngine.setVolume(val);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : 0.8;
    }
    return this.isMuted;
  }
}
