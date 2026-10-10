/**
 * OUTSIDE//OS Audio Chime Engine
 * 
 * 100% offline, local-first Web Audio API singing bowl & mindfulness bell synthesizer.
 * Designed for Pocket Mode so explorers can keep their phone in their pocket while
 * receiving gentle acoustic milestone cues (halfway point, 5m intervals, target completed).
 * 
 * Uses harmonic overtones (fundamental ~432Hz with 2.76x and 5.4x bell ratios)
 * and exponential gain decay with low-pass warm filtering for an authentic bronze singing bowl tone.
 */

export type ChimeMode = 'milestones' | '5min' | '10min' | 'off';

class AudioChimeService {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Unlock AudioContext on initial user interaction (touch/click)
   */
  public unlock(): void {
    if (this.isUnlocked) return;
    const ctx = this.getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
    }
  }

  /**
   * Synthesizes a singular resonant singing bowl strike
   */
  private synthesizeBowlStrike(
    freq: number = 432,
    duration: number = 3.2,
    volume: number = 0.4
  ): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master output with gentle lowpass to remove harsh digital bite
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.connect(ctx.destination);
      filter.connect(masterGain);

      // Acoustic Overtones: [ratio, relativeGain, decayMultiplier]
      const partials = [
        { ratio: 1.0, gain: 0.8, decay: 1.0 },       // Fundamental (warm bronze resonance)
        { ratio: 2.76, gain: 0.35, decay: 0.8 },     // First singing bowl overtone
        { ratio: 5.40, gain: 0.12, decay: 0.55 },    // Shimmering overtone
      ];

      partials.forEach(({ ratio, gain, decay }) => {
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * ratio, now);

        // Subtle micro-pitch warmth
        osc.detune.setValueAtTime((Math.random() - 0.5) * 4, now);

        pGain.gain.setValueAtTime(0.001, now);
        // Soft 15ms attack prevents clicks
        pGain.gain.linearRampToValueAtTime(gain * volume, now + 0.015);
        // Smooth exponential natural decay
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + (duration * decay));

        osc.connect(pGain);
        pGain.connect(filter);

        osc.start(now);
        osc.stop(now + (duration * decay) + 0.1);
      });

      // Master envelope
      masterGain.gain.linearRampToValueAtTime(1.0, now + 0.01);
      masterGain.gain.setValueAtTime(1.0, now + duration - 0.1);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.2);
    } catch {
      // Graceful fallback if Web Audio is restricted
    }
  }

  /**
   * Single warm meditation chime for halfway or interval milestones
   */
  public playMilestoneChime(): void {
    this.synthesizeBowlStrike(432, 3.2, 0.45);
    this.triggerHaptic([40]);
  }

  /**
   * Harmonious two-tone chime (perfect fifth: 432Hz -> 648Hz) for completed expedition
   */
  public playCompletionChime(): void {
    this.synthesizeBowlStrike(432, 2.5, 0.4);
    setTimeout(() => {
      this.synthesizeBowlStrike(648, 3.6, 0.48);
    }, 420);
    this.triggerHaptic([40, 80, 60]);
  }

  /**
   * Short gentle preview chime to test sound level
   */
  public playPreviewChime(): void {
    this.synthesizeBowlStrike(480, 1.8, 0.35);
    this.triggerHaptic([30]);
  }

  /**
   * Haptic vibration helper with fallback
   */
  private triggerHaptic(pattern: number[]): void {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore on devices without vibration support
    }
  }
}

export const chimeService = new AudioChimeService();
