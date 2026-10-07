/**
 * Synthetic Web Audio effects with zero external assets or MP3 dependencies.
 * Guaranteed to work smoothly across all modern browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Theme toggle sound
   * Light mode: bright sparkling melodic chime (C5 -> E5 -> G5)
   * Dark mode: smooth velvety night swoosh (G4 -> D4 -> A3)
   */
  public playThemeToggle(theme: 'light' | 'dark') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (theme === 'light') {
        // Bright morning sunrise chime
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.04, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.22);
        });
      } else {
        // Velvety midnight twilight tone
        [392.0, 293.66, 220.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0.035, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.2);
        });
      }
    } catch {
      // Ignore audio context errors silently
    }
  }

  /**
   * Bubbly pop & resonant chime when voting on today's campus vibe
   */
  public playVibePop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Sweet 2-tone harmonic chime
      [587.33, 880.0, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.04 + 0.08);

        gain.gain.setValueAtTime(0.06, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Alias for vibe vote
   */
  public playVibeVoteSound() {
    this.playVibePop();
  }

  /**
   * Victory streak claim fanfare
   */
  public playStreakClaim() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Arpeggio fanfare: C5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.05, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Peer kudos heart chime / like sound: warm, sparkling, cheerful arpeggio
   */
  public playKudosChime() {
    this.playHeartLike();
  }

  public playHeartLike() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-dopamine sparkling 3-note ascending heart chime: E5 -> G#5 -> B5 -> E6
      const chord = [659.25, 830.61, 987.77, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + idx * 0.045 + 0.1);

        gain.gain.setValueAtTime(0.06, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp UI micro-click for buttons and tabs
   */
  public playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Cheerful success chime when an admin updates settings, adds options, or saves
   */
  public playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [659.25, 880.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.05, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Deletion sound: soft descending sweep
   */
  public playDelete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore
    }
  }

  /**
   * Dislike / Downvote subtle tactile sound
   */
  public playDislike() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two-step downward pop
      [360, 220].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + idx * 0.05 + 0.07);

        gain.gain.setValueAtTime(0.05, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.11);
      });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // High-Fidelity Firing Pixel Matrix Ambient Sound Synthesizer
  // Organic stereo combustion body, wood pops, micro-sizzles & breathing embers
  // Synchronized with WebGL pixel fire field
  // =========================================================================
  private fireNodes: {
    masterGain: GainNode;
    noiseSource: AudioBufferSourceNode;
    rumbleOsc: OscillatorNode;
    rumbleGain: GainNode;
    lfoOsc1?: OscillatorNode;
    lfoGain?: GainNode;
    compressor?: DynamicsCompressorNode;
    crackleTimer: number | null;
    sizzleTimer: number | null;
  } | null = null;

  public startFireAmbient() {
    try {
      if (this.fireNodes) return;
      const ctx = this.getContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 1. Generate 6-second seamless stereo brownian & pink noise buffer for warm roaring firebed
      const bufferSize = ctx.sampleRate * 6;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const leftChannel = noiseBuffer.getChannelData(0);
      const rightChannel = noiseBuffer.getChannelData(1);

      let brownL = 0;
      let brownR = 0;
      let b0L = 0, b1L = 0, b2L = 0, b3L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        // Brownian noise (deep, warm, soothing combustion rush)
        brownL = (brownL + 0.02 * whiteL) / 1.02;
        brownR = (brownR + 0.02 * whiteR) / 1.02;

        // Pink noise (airy flame body)
        b0L = 0.997 * b0L + whiteL * 0.05;
        b1L = 0.985 * b1L + whiteL * 0.12;
        b2L = 0.950 * b2L + whiteL * 0.25;
        b3L = 0.850 * b3L + whiteL * 0.50;
        const pinkL = (b0L + b1L + b2L + b3L) * 0.08;

        b0R = 0.997 * b0R + whiteR * 0.05;
        b1R = 0.985 * b1R + whiteR * 0.12;
        b2R = 0.950 * b2R + whiteR * 0.25;
        b3R = 0.850 * b3R + whiteR * 0.50;
        const pinkR = (b0R + b1R + b2R + b3R) * 0.08;

        // Combine warm brown + pink noise with gentle leveling
        leftChannel[i] = brownL * 0.6 + pinkL * 0.4;
        rightChannel[i] = brownR * 0.6 + pinkR * 0.4;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // 2. High-pass filter to eliminate infrasonic mud below 45Hz
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(45, now);

      // Low-pass filter tuned for soothing, warm flame combustion without high-frequency harshness (460Hz)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(460, now);
      lowpass.Q.setValueAtTime(1.1, now);

      // Peaking warmth filter around 290Hz (dancing air convection body)
      const peakWarmth = ctx.createBiquadFilter();
      peakWarmth.type = 'peaking';
      peakWarmth.frequency.setValueAtTime(290, now);
      peakWarmth.gain.setValueAtTime(2.5, now);
      peakWarmth.Q.setValueAtTime(1.2, now);

      // Master studio compressor for gentle cohesion and glue
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-20, now);
      compressor.knee.setValueAtTime(10, now);
      compressor.ratio.setValueAtTime(3.0, now);
      compressor.attack.setValueAtTime(0.005, now);
      compressor.release.setValueAtTime(0.15, now);

      // Master fire gain with smooth non-abrupt fade-in
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.16, now + 0.5);

      // Connect combustion chain
      noiseSource.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(peakWarmth);
      peakWarmth.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      noiseSource.start();

      // 3. Deep 48Hz resonant hearth hum
      const rumbleOsc = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(48, now);

      rumbleGain.gain.setValueAtTime(0.0001, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.016, now + 0.8);

      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(compressor);
      rumbleOsc.start();

      // 4. Smooth 1.00 Hz flame breathing modulation in sync with WebGL fire animation speed
      const lfoOsc1 = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfoOsc1.type = 'sine';
      lfoOsc1.frequency.setValueAtTime(1.00, now);
      lfoGain.gain.setValueAtTime(0.022, now);

      lfoOsc1.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      lfoOsc1.start();

      // 5. Authentic Acoustic Log Pops & Snaps (Dual-Stage: Sharp Transient + Hollow Wood Thud)
      const playWoodSnap = () => {
        if (!this.fireNodes) return;
        try {
          const t = ctx.currentTime;

          // Stage A: High-frequency transient burst (< 2ms snap)
          const snapLen = Math.floor(ctx.sampleRate * 0.025);
          const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
          const snapData = snapBuf.getChannelData(0);
          for (let i = 0; i < snapLen; i++) {
            snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
          }
          const snapSource = ctx.createBufferSource();
          snapSource.buffer = snapBuf;

          // Bandpass tuned to natural wood grain resonance (900Hz - 2800Hz)
          const snapFilter = ctx.createBiquadFilter();
          snapFilter.type = 'bandpass';
          snapFilter.frequency.setValueAtTime(950 + Math.random() * 1800, t);
          snapFilter.Q.setValueAtTime(3.5 + Math.random() * 2.0, t);

          const snapGain = ctx.createGain();
          const snapVol = 0.045 + Math.random() * 0.06;
          snapGain.gain.setValueAtTime(snapVol, t);
          snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.024);

          snapSource.connect(snapFilter);
          snapFilter.connect(snapGain);

          // Stage B: Hollow wood body resonance (quick decaying sub-tone at 220Hz - 380Hz)
          const woodBodyOsc = ctx.createOscillator();
          const woodBodyGain = ctx.createGain();
          woodBodyOsc.type = 'sine';
          woodBodyOsc.frequency.setValueAtTime(220 + Math.random() * 160, t);

          const bodyVol = snapVol * 0.45;
          woodBodyGain.gain.setValueAtTime(bodyVol, t);
          woodBodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

          woodBodyOsc.connect(woodBodyGain);

          // Spatial Stereo Panning
          if (ctx.createStereoPanner) {
            const panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.7, t);
            snapGain.connect(panner);
            woodBodyGain.connect(panner);
            panner.connect(compressor);
          } else {
            snapGain.connect(compressor);
            woodBodyGain.connect(compressor);
          }

          snapSource.start(t);
          snapSource.stop(t + 0.025);
          woodBodyOsc.start(t);
          woodBodyOsc.stop(t + 0.038);
        } catch {}

        if (this.fireNodes) {
          // Natural fire cadence: bursts of 1-3 pops, followed by calmer pauses
          const isCluster = Math.random() < 0.35;
          const nextInterval = isCluster ? 50 + Math.random() * 90 : 160 + Math.random() * 420;
          this.fireNodes.crackleTimer = window.setTimeout(playWoodSnap, nextInterval);
        }
      };

      // 6. Natural Organic Ember Sizzle (Micro-Noise Bursts, NO synthetic sawtooth!)
      const playMicroSizzle = () => {
        if (!this.fireNodes) return;
        try {
          const t = ctx.currentTime;
          const sizzleLen = Math.floor(ctx.sampleRate * 0.018);
          const sizzleBuf = ctx.createBuffer(1, sizzleLen, ctx.sampleRate);
          const sizzleData = sizzleBuf.getChannelData(0);
          for (let i = 0; i < sizzleLen; i++) {
            sizzleData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.003));
          }
          const sizzleSource = ctx.createBufferSource();
          sizzleSource.buffer = sizzleBuf;

          // High bandpass for delicate ember sparkle (3200Hz - 6500Hz)
          const sizzleFilter = ctx.createBiquadFilter();
          sizzleFilter.type = 'bandpass';
          sizzleFilter.frequency.setValueAtTime(3400 + Math.random() * 2600, t);
          sizzleFilter.Q.setValueAtTime(2.8, t);

          const sizzleGain = ctx.createGain();
          const sizzleVol = 0.012 + Math.random() * 0.016;
          sizzleGain.gain.setValueAtTime(sizzleVol, t);
          sizzleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);

          sizzleSource.connect(sizzleFilter);
          sizzleFilter.connect(sizzleGain);

          if (ctx.createStereoPanner) {
            const panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.6, t);
            sizzleGain.connect(panner);
            panner.connect(compressor);
          } else {
            sizzleGain.connect(compressor);
          }

          sizzleSource.start(t);
          sizzleSource.stop(t + 0.018);
        } catch {}

        if (this.fireNodes) {
          const nextSizzle = 40 + Math.random() * 95;
          this.fireNodes.sizzleTimer = window.setTimeout(playMicroSizzle, nextSizzle);
        }
      };

      const crackleTimer = window.setTimeout(playWoodSnap, 120);
      const sizzleTimer = window.setTimeout(playMicroSizzle, 70);

      this.fireNodes = {
        masterGain,
        noiseSource,
        rumbleOsc,
        rumbleGain,
        lfoOsc1,
        lfoGain,
        compressor,
        crackleTimer,
        sizzleTimer,
      };
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stopFireAmbient() {
    try {
      if (!this.fireNodes) return;
      const {
        masterGain,
        noiseSource,
        rumbleOsc,
        rumbleGain,
        lfoOsc1,
        lfoGain,
        crackleTimer,
        sizzleTimer,
      } = this.fireNodes;

      if (crackleTimer !== null) clearTimeout(crackleTimer);
      if (sizzleTimer !== null) clearTimeout(sizzleTimer);

      const ctx = this.getContext();
      if (ctx) {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        rumbleGain.gain.cancelScheduledValues(now);
        rumbleGain.gain.setValueAtTime(Math.max(rumbleGain.gain.value, 0.0001), now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        setTimeout(() => {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
            rumbleOsc.stop();
            rumbleOsc.disconnect();
            if (lfoOsc1) {
              lfoOsc1.stop();
              lfoOsc1.disconnect();
            }
            if (lfoGain) {
              lfoGain.disconnect();
            }
          } catch {}
        }, 300);
      }

      this.fireNodes = null;
    } catch {
      // Ignore
    }
  }

  /**
   * Suspends the entire Web Audio hardware context immediately.
   * Completely cuts off all audio output when the user switches tabs, leaves the app, or goes home.
   */
  public suspendAudio() {
    try {
      this.stopFireAmbient();
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } catch {}
  }

  /**
   * Resumes the Web Audio hardware context when user returns and focuses the platform.
   */
  public resumeAudio() {
    try {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {}
  }

  /**
   * Rewarding Streak Ignite Sound:
   * Melodic ascending pentatonic arpeggio + fire whoosh
   */
  public playStreakIgnite() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Ascending celebratory notes (C5, E5, G5, B5, C6)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.38);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
