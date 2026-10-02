import { useEffect, useRef } from "react";

import {
  createEngineSound,
  type EngineSample,
  type EngineSound,
} from "./engineSound";

/**
 * Owns a single EngineSound for a replay view. Starts on enable (user gesture),
 * updates on each sample, fades on pause, and disposes on unmount / identity change.
 */
export function useEngineSound({
  enabled,
  volume,
  playing,
  sample,
  /** Change this when the lap/driver changes so the context is rebuilt cleanly. */
  identity,
}: {
  enabled: boolean;
  volume: number;
  playing: boolean;
  sample: EngineSample | null;
  identity: string;
}) {
  const soundRef = useRef<EngineSound | null>(null);
  const sampleRef = useRef(sample);
  sampleRef.current = sample;
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const sound = createEngineSound();
    soundRef.current = sound;
    return () => {
      sound.dispose();
      if (soundRef.current === sound) {
        soundRef.current = null;
      }
    };
  }, [identity]);

  useEffect(() => {
    soundRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const sound = soundRef.current;
    if (!sound) {
      return;
    }

    if (!enabled) {
      sound.stop();
      return;
    }

    // First enable is the user click that unlocks AudioContext.
    sound.start();

    if (playing) {
      if (sampleRef.current) {
        sound.update(sampleRef.current);
      }
      return;
    }

    // Paused: still sing briefly when the scrubber lands on a new sample.
    if (sample) {
      sound.update(sample);
      const timer = window.setTimeout(() => {
        if (!playingRef.current) {
          sound.stop();
        }
      }, 140);
      return () => window.clearTimeout(timer);
    }

    sound.stop();
  }, [
    enabled,
    playing,
    sample?.rpm,
    sample?.throttle,
    sample?.gear,
    sample?.brake,
  ]);
}
