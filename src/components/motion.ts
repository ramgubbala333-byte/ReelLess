import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Shared motion helpers for ScrollTally. Everything runs on the JS driver:
 * these are tiny mascot/counter feedback animations, and JS timing keeps
 * web (verification harness) free of native-driver warnings.
 */
export const EASE_OUT = Easing.out(Easing.cubic);

/**
 * Returns an Animated.Value that eases toward `target` whenever it changes
 * (~600ms ease-out by default). The first render snaps to the target so
 * screens never animate in from zero on mount.
 */
export function useAnimatedNumber(target: number, duration = 600): Animated.Value {
  const value = useRef(new Animated.Value(target)).current;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      value.setValue(target);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: target,
      duration,
      easing: EASE_OUT,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [target, duration, value]);

  return value;
}

/**
 * Runs `run` whenever `dep` changes after the first render. Used for
 * one-shot feedback (pops, flashes, flickers) keyed to a changing value.
 */
export function useOnChange(dep: unknown, run: () => void) {
  const first = useRef(true);
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    runRef.current();
  }, [dep]);
}
