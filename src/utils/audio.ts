class GenerativeLofiSynth {
  private ctx: AudioContext | null = null;
  private interval: any = null;
  public isPlaying: boolean = false;
  private bpm: number = 72;

  // Chords progression loop (retro soft e-piano / Rhodes synth tones)
  // CMaj7 (C3-E3-G3-B3), Am7 (A2-C3-E3-G3), FMaj7 (F2-A2-C3-E3), G6 (G2-B2-D3-E3)
  private chords = [
    [130.81, 164.81, 196.00, 246.94], // C3 E3 G3 B3
    [110.00, 130.81, 164.81, 196.00], // A2 C3 E3 G3
    [87.31, 110.00, 130.81, 164.81],  // F2 A2 C3 E3
    [98.00, 123.47, 146.83, 164.81]   // G2 B2 D3 E3
  ];
  private chordIndex = 0;

  public start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.isPlaying = true;
      this.tick();
    } catch (e) {
      console.warn("Web Audio not supported or blocked: ", e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (err) {}
      this.ctx = null;
    }
  }

  private tick() {
    if (!this.isPlaying || !this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        // Handle browser user interaction activation policy
        this.ctx.resume();
      }

      const chord = this.chords[this.chordIndex];
      const now = this.ctx.currentTime;

      // Play warm, filtered triangle waves
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.045 - i * 0.006, now + 0.15); // soft swell
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.9); // long smooth fade

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 4);
      });

      // Add soft snaps (vinyl record or lofi retro wire tap effect on beats 2 and 4)
      const beatLength = 60 / this.bpm;
      const snapTime2 = now + beatLength * 1;
      const snapTime4 = now + beatLength * 3;

      [snapTime2, snapTime4].forEach(t => {
        this.playSnap(t);
      });

      // Staggered warm keyboard bell tones
      if (Math.random() > 0.2) {
        const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // pentatonic scale C4 D4 E4 G4 A4 C5
        const noteFreq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const delay = beatLength * Math.floor(Math.random() * 4);
        this.playMelody(noteFreq, now + delay);
      }

      this.chordIndex = (this.chordIndex + 1) % this.chords.length;

      this.interval = setTimeout(() => {
        this.tick();
      }, 4000); // 4 seconds per chord loop
    } catch (err) {
      console.warn("Generative tick error", err);
    }
  }

  private playSnap(time: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, time);
      osc.frequency.exponentialRampToValueAtTime(120, time + 0.05);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(1400, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.015, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.08);
    } catch (e) {}
  }

  private playMelody(freq: number, time: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.012, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 1.2);
    } catch (e) {}
  }
}

export const lofiBgm = new GenerativeLofiSynth();
