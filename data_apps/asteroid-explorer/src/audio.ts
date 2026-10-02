// Ambient sonification: a drone that brightens and swells as the nearest hazardous asteroid comes
// closer to Earth, soft plucks that quicken with it, plus one voice per circled asteroid whose
// pitch and loudness rise as it approaches. Web Audio only; starts from a user click (browsers
// require a gesture). Pitched to be audible on laptop speakers, which drop everything under ~100 Hz.

const SCALE = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37, 659.25, 739.99, 880, 987.77, 1108.73, 1318.51];

// 1 near the Moon's distance, 0 beyond ~300 lunar distances.
export function closeness(lunarDistances: number) {
  return Math.min(1, Math.max(0, 1 - Math.log10(Math.max(1, lunarDistances)) / Math.log10(300)));
}

type Voice = { osc: OscillatorNode; gain: GainNode };

export class Ambient {
  private ctx: AudioContext;
  private master: GainNode;
  private filter: BiquadFilterNode;
  private drone: GainNode;
  private voices: Voice[] = [];
  private nextPluck = 0;

  constructor() {
    this.ctx = new AudioContext();
    // A compressor keeps the loudest moments (several close voices) from clipping.
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.connect(this.ctx.destination);
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp);
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 600;
    this.filter.Q.value = 6;
    this.drone = this.ctx.createGain();
    this.drone.gain.value = 0.5;
    this.filter.connect(this.drone).connect(this.master);
    // Drone: detuned saws an octave and a fifth up from the old 55 Hz, so small speakers carry it.
    for (const [freq, type, g] of [[110, "sawtooth", 0.16], [110.7, "sawtooth", 0.16], [164.8, "triangle", 0.2], [220.3, "triangle", 0.1]] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = this.ctx.createGain();
      gain.gain.value = g;
      osc.connect(gain).connect(this.filter);
      osc.start();
    }
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(this.filter.frequency);
    lfo.start();
    // Four voices for circled asteroids A-D.
    for (let k = 0; k < 4; k++) {
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(this.master);
      osc.start();
      this.voices.push({ osc, gain });
    }
    this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.8);
  }

  // A short bell: sine with a fast attack and an exponential tail.
  private pluck(freq: number, level: number) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 1.7);
  }

  // nearest: lunar distances of the closest hazardous asteroid; circled: one per sleeve, in mark order.
  update(nearest: number, circled: number[]) {
    const t = this.ctx.currentTime;
    const c = closeness(nearest);
    this.filter.frequency.setTargetAtTime(350 + 3200 * c, t, 0.5);
    this.drone.gain.setTargetAtTime(0.35 + 0.5 * c, t, 0.5);
    // Plucks: one every ~3 s when everything is far, several a second during a close pass.
    if (t >= this.nextPluck) {
      const top = Math.round(c * (SCALE.length - 1));
      this.pluck(SCALE[Math.max(0, top - Math.floor(Math.random() * 4))], 0.08 + 0.18 * c);
      this.nextPluck = t + 3 - 2.6 * c + Math.random() * 0.4;
    }
    this.voices.forEach((v, k) => {
      const ld = circled[k];
      if (ld == null) return v.gain.gain.setTargetAtTime(0, t, 0.4);
      const ck = closeness(ld);
      const note = SCALE[Math.round(ck * (SCALE.length - 1))] * (k % 2 ? 0.75 : 0.5);
      v.osc.frequency.setTargetAtTime(note, t, 0.25);
      v.gain.gain.setTargetAtTime(0.05 + 0.22 * ck, t, 0.3);
    });
  }

  close() {
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    setTimeout(() => void this.ctx.close(), 1200);
  }
}
