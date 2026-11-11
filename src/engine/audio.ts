// Fully procedural audio (WebAudio): distorted power-chord riffs, drums and effects. No asset files needed.
export type MusicStyle = 'heavy' | 'gothic' | 'symphonic' | 'power' | 'doom';

interface StyleDef {
  bpm: number; root: number; riff: (number | null)[]; kick: string; snare: string; hat: string;
  pad?: number[]; lead?: (number | null)[]; mute: number; gallop?: boolean;
}
const STYLES: Record<MusicStyle, StyleDef> = {
  heavy: { bpm: 126, root: 40, mute: 0.11, kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    riff: [0, 0, null, 0, 3, null, 0, 0, null, 5, null, 3, 0, 0, null, 7] },
  gothic: { bpm: 96, root: 38, mute: 0.2, kick: 'x.......x.x.....', snare: '........x.......', hat: '..x...x...x...x.',
    riff: [0, null, 0, null, 1, null, 0, null, 3, null, 3, null, 7, null, 6, null], pad: [0, 3, 7], lead: [12, null, null, 15, null, null, 13, null, 12, null, null, 10, null, null, null, null] },
  symphonic: { bpm: 118, root: 43, mute: 0.14, kick: 'x...x...x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.xx',
    riff: [0, 0, null, 0, null, 3, null, 5, 0, 0, null, 0, null, 7, null, 5], pad: [0, 7, 12], lead: [12, null, 15, null, 19, null, 15, null, 12, null, 14, null, 17, null, 14, null] },
  power: { bpm: 158, root: 45, mute: 0.08, gallop: true, kick: 'x.xx.xx.x.xx.xx.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    riff: [0, 0, 0, null, 0, 0, 0, null, 3, 3, 3, null, 5, 5, 5, null] },
  doom: { bpm: 58, root: 36, mute: 0.9, kick: 'x...............', snare: '........x.......', hat: '................',
    riff: [0, null, null, null, null, null, null, null, 3, null, null, null, 1, null, null, null], pad: [0, 7, 12] },
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode; private sfxG!: GainNode; private musicG!: GainNode;
  private dist!: WaveShaperNode; private noiseBuf!: AudioBuffer;
  private timer: number | undefined; private step = 0; private nextT = 0; private style: MusicStyle | null = null;
  sfxOn = true; musicOn = true; sfxVol = 0.7; musicVol = 0.5;
  // optional recorded music file (replaces the synth loop while it plays)
  private fileEl: HTMLAudioElement | null = null; private fileUrl: string | null = null;

  unlock() {
    if (this.fileEl && this.fileEl.paused && this.musicOn) void this.fileEl.play().catch(() => { /* still blocked */ });
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
      } catch { return; }
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = 0.9; this.master.connect(c.destination);
      this.sfxG = c.createGain(); this.sfxG.connect(this.master);
      this.musicG = c.createGain(); this.musicG.connect(this.master);
      this.dist = c.createWaveShaper();
      const k = 60, curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)); }
      this.dist.curve = curve; this.dist.oversample = '2x';
      const len = c.sampleRate * 1.5; this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.apply();
      if (this.style && this.musicOn) this.startLoop();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }
  configure(o: { sfx: boolean; music: boolean; sfxVol: number; musicVol: number }) {
    this.sfxOn = o.sfx; this.musicOn = o.music; this.sfxVol = o.sfxVol; this.musicVol = o.musicVol;
    this.apply();
    if (this.ctx) { if (this.musicOn && this.style && this.timer === undefined) this.startLoop(); if (!this.musicOn) this.stopLoop(); }
  }
  private apply() {
    if (this.fileEl) this.fileEl.volume = this.fileVol();
    if (!this.ctx) return;
    this.sfxG.gain.value = this.sfxOn ? this.sfxVol : 0;
    this.musicG.gain.value = this.musicOn ? this.musicVol * 0.55 : 0;
  }

  // ───────── building blocks ─────────
  private tone(f: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, slide = 0, when = 0, out?: AudioNode) {
    const c = this.ctx!; const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out ?? this.sfxG); o.start(t); o.stop(t + dur + 0.05);
  }
  private noise(dur: number, vol = 0.3, ftype: BiquadFilterType = 'lowpass', f0 = 1000, f1 = 200, when = 0, out?: AudioNode) {
    const c = this.ctx!; const t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const fl = c.createBiquadFilter(); fl.type = ftype; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(out ?? this.sfxG); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  private chord(root: number, dur: number, vol = 0.25, when = 0, out?: AudioNode, fifth = true) {
    const c = this.ctx!; const t = c.currentTime + when;
    const g = c.createGain(); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const ws = c.createWaveShaper(); ws.curve = this.dist.curve; ws.oversample = '2x';
    const notes = fifth ? [root, root + 7, root + 12] : [root];
    notes.forEach((n, i) => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = (i - 1) * 6;
      o.connect(ws); o.start(t); o.stop(t + dur + 0.05);
    });
    ws.connect(lp); lp.connect(g); g.connect(out ?? this.sfxG);
  }

  // ───────── sfx ─────────
  sfx(name: string) {
    if (!this.ctx || !this.sfxOn) return;
    const T = this;
    switch (name) {
      case 'swap': T.tone(420, 0.06, 'triangle', 0.12, 1.4); break;
      case 'swapBad': T.tone(140, 0.14, 'sawtooth', 0.14, 0.6); break;
      case 'match': T.tone(520, 0.1, 'triangle', 0.18, 1.5); T.tone(780, 0.12, 'sine', 0.12, 1.2, 0.05); break;
      case 'combo': T.tone(660, 0.12, 'square', 0.1, 1.5); T.tone(990, 0.16, 'triangle', 0.18, 1.3, 0.06); T.tone(1320, 0.2, 'sine', 0.12, 1.2, 0.12); break;
      case 'hit': T.noise(0.18, 0.5, 'lowpass', 1800, 200); T.tone(110, 0.18, 'sine', 0.5, 0.4); break;
      case 'crit': T.noise(0.25, 0.6, 'lowpass', 3000, 160); T.tone(90, 0.25, 'sine', 0.6, 0.4); T.tone(1400, 0.3, 'square', 0.1, 0.8, 0.02); break;
      case 'playerHit': T.noise(0.22, 0.45, 'bandpass', 900, 150); T.tone(70, 0.25, 'sine', 0.5, 0.5); break;
      case 'fire': T.noise(0.45, 0.4, 'bandpass', 600, 2400); T.tone(180, 0.4, 'sawtooth', 0.1, 1.6); break;
      case 'lightning': T.noise(0.2, 0.5, 'highpass', 3000, 6000); T.tone(1800, 0.25, 'sawtooth', 0.2, 0.08); T.tone(90, 0.3, 'square', 0.18, 0.5, 0.05); break;
      case 'dark': T.tone(70, 0.6, 'sawtooth', 0.22, 0.7); T.tone(73, 0.6, 'sawtooth', 0.2, 0.7); T.noise(0.5, 0.2, 'lowpass', 500, 90); break;
      case 'explosion': T.noise(0.9, 0.7, 'lowpass', 2400, 70); T.tone(60, 0.7, 'sine', 0.8, 0.3); break;
      case 'roar': T.tone(90, 0.7, 'sawtooth', 0.28, 0.5); T.tone(130, 0.7, 'sawtooth', 0.18, 0.4, 0.02); T.noise(0.7, 0.25, 'bandpass', 500, 160); break;
      case 'card': T.chord(40 + Math.floor(Math.random() * 5), 0.35, 0.22); T.noise(0.12, 0.2, 'highpass', 4000, 8000); break;
      case 'heal': [72, 76, 79, 84].forEach((n, i) => T.tone(mtof(n), 0.3, 'sine', 0.16, 1, i * 0.07)); break;
      case 'shield': T.tone(880, 0.35, 'square', 0.1, 0.6); T.tone(1320, 0.4, 'triangle', 0.14, 0.7, 0.02); T.noise(0.1, 0.25, 'highpass', 5000, 9000); break;
      case 'buff': [60, 64, 67, 72].forEach((n, i) => T.tone(mtof(n), 0.18, 'triangle', 0.14, 1, i * 0.06)); break;
      case 'dodge': T.noise(0.12, 0.2, 'highpass', 2000, 6000); break;
      case 'shuffle': for (let i = 0; i < 6; i++) T.tone(300 + i * 80, 0.06, 'triangle', 0.1, 1.2, i * 0.04); break;
      case 'ultimate': T.chord(40, 1.2, 0.35); T.chord(47, 1.2, 0.3, 0.2); T.noise(1.0, 0.5, 'lowpass', 3000, 90); T.tone(55, 1.2, 'sine', 0.7, 0.3); break;
      case 'victory': [0, 0, 3, 5, 7].forEach((n, i) => T.chord(52 + n, 0.35, 0.28, i * 0.2)); T.chord(55, 1.4, 0.32, 1.1); break;
      case 'defeat': [52, 50, 48, 45].forEach((n, i) => T.chord(n - 12, 0.7, 0.28, i * 0.4)); break;
      case 'ui': T.tone(600, 0.05, 'triangle', 0.1, 1.3); break;
      case 'ui2': T.tone(420, 0.09, 'triangle', 0.14, 1.5); T.tone(630, 0.09, 'triangle', 0.1, 1.2, 0.05); break;
    }
  }

  // ───────── music ─────────
  /** Play a looping recorded track (pass null to stop). While it plays the synth music is off. */
  track(url: string | null) {
    if (url === this.fileUrl) return;
    this.fadeOutFile();
    this.fileUrl = url;
    if (!url) return;
    this.style = null; this.stopLoop();
    const el = new Audio(url);
    el.loop = true; el.volume = this.fileVol(); this.fileEl = el;
    void el.play().catch(() => { /* autoplay blocked: unlock() retries on the first click/key */ });
  }
  private fileVol() { return this.musicOn ? Math.min(1, this.musicVol * 0.9) : 0; }
  private fadeOutFile() {
    const el = this.fileEl; this.fileEl = null;
    if (!el) return;
    const t = window.setInterval(() => {
      el.volume = Math.max(0, el.volume - 0.08);
      if (el.volume <= 0.001) { window.clearInterval(t); el.pause(); }
    }, 50);
  }
  music(style: MusicStyle | null) {
    if (this.fileUrl) { this.fadeOutFile(); this.fileUrl = null; }
    if (style === this.style) return;
    this.style = style; this.stopLoop(); this.step = 0;
    if (style && this.ctx && this.musicOn) this.startLoop();
  }
  private startLoop() {
    if (!this.ctx || !this.style) return;
    this.nextT = this.ctx.currentTime + 0.1; this.step = 0;
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.schedule(), 40);
  }
  private stopLoop() { window.clearInterval(this.timer); this.timer = undefined; }
  private schedule() {
    const c = this.ctx; if (!c || !this.style) return;
    const st = STYLES[this.style]; const stepDur = 60 / st.bpm / 4;
    while (this.nextT < c.currentTime + 0.25) {
      const i = this.step % 16; const when = Math.max(0, this.nextT - c.currentTime);
      const m = this.musicG;
      const note = st.riff[i];
      if (note !== null) this.chord(st.root + note, Math.max(0.08, stepDur * (st.mute > 0.5 ? 7 : st.mute * 7)), st.mute > 0.5 ? 0.3 : 0.2, when, m);
      if (st.kick[i] === 'x') { this.tone(120, 0.18, 'sine', 0.9, 0.3, when, m); this.noise(0.04, 0.2, 'lowpass', 600, 200, when, m); }
      if (st.snare[i] === 'x') { this.noise(0.16, 0.45, 'highpass', 1800, 3500, when, m); this.tone(200, 0.1, 'triangle', 0.25, 0.6, when, m); }
      if (st.hat[i] === 'x') this.noise(0.03, 0.12, 'highpass', 6000, 9000, when, m);
      if (st.pad && i === 0 && this.step % 32 === 0) st.pad.forEach((p) => this.tone(mtof(st.root + 12 + p), stepDur * 30, 'sawtooth', 0.045, 1, when, m));
      if (st.lead && st.lead[i] !== null && st.lead[i] !== undefined) this.tone(mtof(st.root + 12 + st.lead[i]!), stepDur * 3, 'square', 0.05, 1, when, m);
      this.nextT += stepDur; this.step++;
    }
  }
}
export const audio = new AudioEngine();
