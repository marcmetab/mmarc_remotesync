/**
 * Synthetic F1 engine note driven by lap-telemetry samples.
 * Web Audio API only — no files, no extra dependencies.
 *
 * Deep + dirty: strong sub octaves, grit noise, and soft-clip overdrive
 * that opens with throttle.
 */

export type EngineSample = {
  rpm: number | null;
  throttle: number | null;
  gear: number | null;
  brake: number | null;
};

export type EngineSound = {
  /** Create/resume AudioContext. Call from a user gesture. */
  start: () => void;
  update: (sample: EngineSample) => void;
  setVolume: (volume: number) => void;
  /** Fade master gain to silence without closing the context. */
  stop: () => void;
  /** Tear down nodes and close the context. */
  dispose: () => void;
  readonly started: boolean;
};

/**
 * Firing frequency, biased low so the note sits in the chest rather than
 * the "bee" register. Exported for a focused unit check if tests appear.
 */
export function rpmToFrequency(rpm: number | null | undefined): number {
  // /32 ≈ deep chest note; *1.5 raises pitch ~50% (~560 Hz fund at 12k).
  return (Math.max(rpm ?? 0, 4000) / 32) * 1.5;
}

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

export function createEngineSound(): EngineSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let drive: WaveShaperNode | null = null;
  let driveInput: GainNode | null = null;
  let bodyFilter: BiquadFilterNode | null = null;
  let airFilter: BiquadFilterNode | null = null;
  let noiseGain: GainNode | null = null;
  let noiseSource: AudioBufferSourceNode | null = null;
  let rumbleFilter: BiquadFilterNode | null = null;
  let rumbleGain: GainNode | null = null;
  let rumbleSource: AudioBufferSourceNode | null = null;

  let subDeep: Voice | null = null;
  let sub: Voice | null = null;
  let fundamental: Voice | null = null;
  let growl: Voice | null = null;
  let grit: Voice | null = null;

  let userVolume = 0.7;
  let lastGear: number | null = null;
  let lastThrottleEffective = 0;
  let audible = false;
  let started = false;
  let disposed = false;

  const ensureGraph = () => {
    if (disposed) {
      return false;
    }
    if (
      ctx &&
      master &&
      drive &&
      driveInput &&
      bodyFilter &&
      airFilter &&
      rumbleFilter &&
      rumbleGain &&
      subDeep &&
      sub &&
      fundamental &&
      growl &&
      grit
    ) {
      return true;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtx();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Soft-clip overdrive — amount controlled by driveInput gain.
    drive = ctx.createWaveShaper();
    drive.curve = makeDistortionCurve(0.65);
    drive.oversample = "4x";
    drive.connect(master);

    driveInput = ctx.createGain();
    driveInput.gain.value = 0.55;
    driveInput.connect(drive);

    // Mid path through a dark low-pass into the drive.
    bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = 700;
    bodyFilter.Q.value = 0.8;
    bodyFilter.connect(driveInput);

    // Bass bus skips the mid filter; kept light so mids/distortion lead.
    const bassBus = ctx.createGain();
    bassBus.gain.value = 0.29;
    bassBus.connect(driveInput);

    const f0 = rpmToFrequency(4000);

    // Quiet sub octaves — ~25% of the previous boom levels.
    subDeep = createVoice(ctx, "sine", f0 * 0.125, 0.175, bassBus);
    sub = createVoice(ctx, "sine", f0 * 0.25, 0.14, bassBus);

    // Triangle body + detuned saws for growly distortion food.
    fundamental = createVoice(ctx, "triangle", f0 * 0.5, 0.35, bodyFilter);
    growl = createVoice(ctx, "sawtooth", f0 * 0.5 * 0.985, 0.22, bodyFilter);
    grit = createVoice(ctx, "sawtooth", f0 * 0.5 * 1.03, 0.14, bodyFilter);

    // Mid exhaust rasp.
    airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.value = 380;
    airFilter.Q.value = 0.55;
    airFilter.connect(bodyFilter);

    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseGain.connect(airFilter);

    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = makeNoiseBuffer(ctx, 1.5);
    noiseSource.loop = true;
    noiseSource.connect(noiseGain);
    noiseSource.start();

    // Low rumble bed — filtered noise under ~120 Hz.
    rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 110;
    rumbleFilter.Q.value = 0.7;
    rumbleFilter.connect(bassBus);

    rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.05;
    rumbleGain.connect(rumbleFilter);

    rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = makeNoiseBuffer(ctx, 2);
    rumbleSource.loop = true;
    rumbleSource.connect(rumbleGain);
    rumbleSource.start();

    subDeep.osc.start();
    sub.osc.start();
    fundamental.osc.start();
    growl.osc.start();
    grit.osc.start();

    started = true;
    return true;
  };

  const glide = (param: AudioParam, value: number, timeConstant = 0.05) => {
    if (!ctx) {
      return;
    }
    param.setTargetAtTime(value, ctx.currentTime, timeConstant);
  };

  const masterLevel = (throttleEffective: number) =>
    Math.max(0, (0.11 + throttleEffective * 0.0016) * userVolume);

  const applyMasterGain = (throttleEffective: number, dip = false) => {
    if (!ctx || !master) {
      return;
    }
    lastThrottleEffective = throttleEffective;
    if (dip) {
      glide(master.gain, 0.03 * userVolume, 0.008);
      master.gain.setTargetAtTime(masterLevel(throttleEffective), ctx.currentTime + 0.04, 0.02);
    } else {
      glide(master.gain, masterLevel(throttleEffective), 0.05);
    }
    audible = true;
  };

  return {
    get started() {
      return started && !disposed;
    },

    start() {
      if (disposed) {
        return;
      }
      if (!ensureGraph() || !ctx) {
        return;
      }
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
    },

    update(sample) {
      if (disposed) {
        return;
      }
      if (
        !ensureGraph() ||
        !ctx ||
        !driveInput ||
        !bodyFilter ||
        !airFilter ||
        !noiseGain ||
        !rumbleGain ||
        !subDeep ||
        !sub ||
        !fundamental ||
        !growl ||
        !grit
      ) {
        return;
      }
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const f0 = rpmToFrequency(sample.rpm);
      // Keep harmonic ratios relative to the lowered fundamental.
      const fund = f0 * 0.5;
      glide(subDeep.osc.frequency, f0 * 0.125);
      glide(sub.osc.frequency, f0 * 0.25);
      glide(fundamental.osc.frequency, fund);
      glide(growl.osc.frequency, fund * 0.985);
      glide(grit.osc.frequency, fund * 1.03);

      const throttle = clamp(sample.throttle ?? 0, 0, 100);
      const braking = sample.brake === 1;
      const throttleEffective = braking ? throttle * 0.12 : throttle;
      const t = throttleEffective / 100;

      // Darker filter; opens a little with throttle but stays growly.
      glide(bodyFilter.frequency, 380 + throttleEffective * 12);
      glide(airFilter.frequency, 260 + fund * 0.45);
      glide(noiseGain.gain, 0.04 + t * 0.18, 0.06);
      glide(rumbleGain.gain, 0.045 + (1 - t) * 0.03, 0.08);

      // Push into the waveshaper harder as throttle opens → more grit.
      glide(driveInput.gain, 0.45 + t * 0.85, 0.07);

      const midScale = 0.5 + t * 0.55;
      glide(fundamental.gain.gain, 0.35 * midScale, 0.06);
      glide(growl.gain.gain, 0.22 * midScale, 0.06);
      glide(grit.gain.gain, (0.1 + t * 0.12) * midScale, 0.06);
      // Light subs only — ~25% of prior bass levels.
      glide(subDeep.gain.gain, 0.16 + (1 - t) * 0.05, 0.08);
      glide(sub.gain.gain, 0.125 + (1 - t) * 0.025, 0.08);

      const gear = sample.gear;
      const gearChanged = gear != null && lastGear != null && gear !== lastGear;
      if (gear != null) {
        lastGear = gear;
      }

      applyMasterGain(throttleEffective, gearChanged);
    },

    setVolume(volume) {
      userVolume = clamp(volume, 0, 1);
      if (audible && master && ctx) {
        glide(master.gain, masterLevel(lastThrottleEffective), 0.04);
      }
    },

    stop() {
      if (!ctx || !master || !started) {
        return;
      }
      glide(master.gain, 0, 0.08);
      audible = false;
    },

    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      started = false;
      audible = false;
      try {
        subDeep?.osc.stop();
        sub?.osc.stop();
        fundamental?.osc.stop();
        growl?.osc.stop();
        grit?.osc.stop();
        noiseSource?.stop();
        rumbleSource?.stop();
      } catch {
        // already stopped
      }
      subDeep?.osc.disconnect();
      subDeep?.gain.disconnect();
      sub?.osc.disconnect();
      sub?.gain.disconnect();
      fundamental?.osc.disconnect();
      fundamental?.gain.disconnect();
      growl?.osc.disconnect();
      growl?.gain.disconnect();
      grit?.osc.disconnect();
      grit?.gain.disconnect();
      noiseSource?.disconnect();
      noiseGain?.disconnect();
      airFilter?.disconnect();
      rumbleSource?.disconnect();
      rumbleGain?.disconnect();
      rumbleFilter?.disconnect();
      bodyFilter?.disconnect();
      driveInput?.disconnect();
      drive?.disconnect();
      master?.disconnect();
      const closing = ctx;
      ctx = null;
      master = null;
      drive = null;
      driveInput = null;
      bodyFilter = null;
      airFilter = null;
      noiseGain = null;
      noiseSource = null;
      rumbleFilter = null;
      rumbleGain = null;
      rumbleSource = null;
      subDeep = null;
      sub = null;
      fundamental = null;
      growl = null;
      grit = null;
      lastGear = null;
      if (closing) {
        void closing.close();
      }
    },
  };
}

function createVoice(
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
  level: number,
  destination: AudioNode,
): Voice {
  const gain = ctx.createGain();
  gain.gain.value = level;
  gain.connect(destination);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  return { osc, gain };
}

/** Soft-clip curve; amount 0..1 controls how hard it saturates. */
function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 2048;
  const curve = new Float32Array(n);
  const k = 2 + amount * 40;
  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
