// src/audio-system.js - 3-band FFT spectrum analyzer, DJ audio player, and procedural SFX

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

  // Calculate average energy per band
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
 * Prevents visual stagnation across both quiet (-20dB) and loud (0dB) tracks.
 * @param {number} current - Current band energy (0-255)
 * @param {number} avg - Previous smoothed average
 * @param {number} smoothing - Smoothing weight (0.85)
 * @returns {object} { flux, newAvg }
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
 * Audio System Manager running in browser with Web Audio API.
 */
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.gainNode = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.spectrum = new Uint8Array(256);
    this.bassAvg = 50;
    this.midsAvg = 50;
    this.trebleAvg = 50;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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
      // Dual sine coin clink
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
      // Sawtooth DJ airhorn
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
      // Low-pass filtered noise bass boom
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
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}
