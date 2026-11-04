import { useEffect, useId, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { ClipPath, Ellipse, G, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';
import { EASE_OUT, useAnimatedNumber } from './motion';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export type VoltMood = 'bright' | 'steady' | 'tired' | 'empty';
export type VoltVariant = 'volt' | 'juno';

export function voltMood(count: number, goal: number): { mood: VoltMood; pct: number } {
  const pct = goal <= 0 ? 0 : Math.max(0, 1 - count / goal);
  if (count > goal || pct <= 0.08) return { mood: 'empty', pct: 0 };
  if (pct > 0.6) return { mood: 'bright', pct };
  if (pct > 0.32) return { mood: 'steady', pct };
  return { mood: 'tired', pct };
}

/**
 * Volt: a rounded battery character drawn in code. The fill is his charge;
 * the face follows the mood. Wide body, small terminal cap on top.
 * The 'juno' variant is the duel rival's colorway (teal charge, deeper
 * navy shell) — same character rig, different paint.
 *
 * Motion (RN Animated, JS driver): the fill eases to the new charge over
 * ~600ms; bright Volt breathes (a gentle ±2 bob) and blinks on a slow
 * loop; a light shimmer sweeps the charge while he is bright or steady;
 * tired Volt droops and settles; empty Volt flickers and shakes once when
 * he first runs dry; face-state changes get a subtle scale pulse.
 */
export default function Volt({
  count,
  goal,
  size = 150,
  variant = 'volt',
}: {
  count: number;
  goal: number;
  size?: number;
  variant?: VoltVariant;
}) {
  const { mood, pct } = voltMood(count, goal);
  const juno = variant === 'juno';
  const fillColor =
    mood === 'empty'
      ? colors.rust
      : mood === 'tired'
        ? juno
          ? '#2E8C7A'
          : colors.rustSoft
        : juno
          ? colors.sage
          : colors.amber;
  const bodyFill = juno ? '#22406B' : colors.panelAlt;
  const capFill = juno ? colors.line : colors.line;
  const bodyW = 118;
  const bodyH = 76;
  const x = (160 - bodyW) / 2;
  const y = 34;
  const eyeY = y + 34;
  const leftEyeX = x + 42;
  const rightEyeX = x + bodyW - 42;

  // Animated charge fill.
  const animPct = useAnimatedNumber(pct, 600);
  const fillWidth = animPct.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bodyW - 12],
  });

  // Motion state.
  const breath = useRef(new Animated.Value(0.5)).current;
  const droop = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevMood = useRef<VoltMood | null>(null);

  // Blink loop (eyes are circles only in bright/steady moods).
  const eyeOpen = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (mood !== 'bright' && mood !== 'steady') {
      eyeOpen.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2300),
        Animated.timing(eyeOpen, { toValue: 0.1, duration: 70, useNativeDriver: false }),
        Animated.timing(eyeOpen, { toValue: 1, duration: 140, useNativeDriver: false }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mood, eyeOpen]);
  const eyeRy = (r: number) =>
    eyeOpen.interpolate({ inputRange: [0, 1], outputRange: [0.7, r] });

  // Charge shimmer: a soft light band sweeps the fill while charged.
  const clipId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const sweep = useRef(new Animated.Value(-36)).current;
  useEffect(() => {
    if (mood !== 'bright' && mood !== 'steady') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: bodyW + 24,
          duration: 2300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(1700),
        Animated.timing(sweep, { toValue: -36, duration: 0, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mood, sweep, bodyW]);

  useEffect(() => {
    const prev = prevMood.current;
    prevMood.current = mood;

    // Breathing bob only while bright; otherwise settle back to centre.
    let loop: Animated.CompositeAnimation | null = null;
    if (mood === 'bright') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breath, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(breath, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
      loop.start();
    } else {
      Animated.timing(breath, {
        toValue: 0.5,
        duration: 300,
        easing: EASE_OUT,
        useNativeDriver: false,
      }).start();
    }

    // Tired Volt droops: a slight rotate and downward settle.
    Animated.timing(droop, {
      toValue: mood === 'tired' ? 1 : 0,
      duration: mood === 'tired' ? 800 : 350,
      easing: EASE_OUT,
      useNativeDriver: false,
    }).start();

    if (prev !== mood) {
      if (mood === 'empty') {
        // One short flicker + shake when Volt first runs dry (incl. mount).
        Animated.sequence([
          Animated.timing(flicker, { toValue: 0.35, duration: 55, useNativeDriver: false }),
          Animated.timing(flicker, { toValue: 1, duration: 55, useNativeDriver: false }),
          Animated.timing(flicker, { toValue: 0.55, duration: 45, useNativeDriver: false }),
          Animated.timing(flicker, { toValue: 1, duration: 90, useNativeDriver: false }),
        ]).start();
        Animated.sequence([
          Animated.timing(shakeX, { toValue: -3, duration: 45, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: 3, duration: 45, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: -2, duration: 40, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: false }),
        ]).start();
      } else if (prev !== null) {
        // Face state changed: subtle scale pulse.
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.94, duration: 110, easing: EASE_OUT, useNativeDriver: false }),
          Animated.timing(pulse, { toValue: 1, duration: 190, easing: EASE_OUT, useNativeDriver: false }),
        ]).start();
      }
    }

    return () => {
      loop?.stop();
    };
  }, [mood, breath, droop, flicker, shakeX, pulse]);

  const breathY = breath.interpolate({ inputRange: [0, 1], outputRange: [2, -2] });
  const droopRotate = droop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '3deg'] });
  const droopY = droop.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY: breathY }] }}>
      <Animated.View
        style={{
          opacity: flicker,
          transform: [
            { rotate: droopRotate },
            { translateY: droopY },
            { translateX: shakeX },
            { scale: pulse },
          ],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 160 130">
          <ClipPath id={clipId}>
            <Rect x={x + 6} y={y + 6} width={bodyW - 12} height={bodyH - 12} rx={16} />
          </ClipPath>
          {/* terminal cap */}
          <Rect x={68} y={18} width={24} height={14} rx={5} fill={capFill} />
          {/* body */}
          <Rect x={x} y={y} width={bodyW} height={bodyH} rx={22} fill={bodyFill} stroke={mood === 'empty' ? colors.rust : colors.line} strokeWidth={3} />
          {/* charge fill (animated width) */}
          <AnimatedRect
            x={x + 6}
            y={y + 6}
            width={fillWidth}
            height={bodyH - 12}
            rx={16}
            fill={fillColor}
            opacity={0.9}
          />
          {/* shimmer sweep, clipped to the fill window */}
          {mood === 'bright' || mood === 'steady' ? (
            <G clipPath={`url(#${clipId})`}>
              <AnimatedRect
                x={sweep}
                y={y - 8}
                width={15}
                height={bodyH + 16}
                fill="#FFFFFF"
                opacity={0.16}
                transform={`rotate(18 80 72)`}
              />
            </G>
          ) : null}
          {/* eyes */}
          {mood === 'bright' ? (
            <>
              <AnimatedEllipse cx={leftEyeX} cy={eyeY} rx={5.5} ry={eyeRy(5.5)} fill={colors.black} />
              <AnimatedEllipse cx={rightEyeX} cy={eyeY} rx={5.5} ry={eyeRy(5.5)} fill={colors.black} />
            </>
          ) : mood === 'steady' ? (
            <>
              <AnimatedEllipse cx={leftEyeX} cy={eyeY} rx={5} ry={eyeRy(5)} fill={colors.black} />
              <AnimatedEllipse cx={rightEyeX} cy={eyeY} rx={5} ry={eyeRy(5)} fill={colors.black} />
            </>
          ) : mood === 'tired' ? (
            <>
              <Path d={`M ${leftEyeX - 7} ${eyeY} L ${leftEyeX + 7} ${eyeY}`} stroke={colors.black} strokeWidth={3.4} strokeLinecap="round" />
              <Path d={`M ${rightEyeX - 7} ${eyeY} L ${rightEyeX + 7} ${eyeY}`} stroke={colors.black} strokeWidth={3.4} strokeLinecap="round" />
            </>
          ) : (
            <>
              <Path d={`M ${leftEyeX - 6} ${eyeY - 6} L ${leftEyeX + 6} ${eyeY + 6} M ${leftEyeX + 6} ${eyeY - 6} L ${leftEyeX - 6} ${eyeY + 6}`} stroke={colors.cream} strokeWidth={3.2} strokeLinecap="round" />
              <Path d={`M ${rightEyeX - 6} ${eyeY - 6} L ${rightEyeX + 6} ${eyeY + 6} M ${rightEyeX + 6} ${eyeY - 6} L ${rightEyeX - 6} ${eyeY + 6}`} stroke={colors.cream} strokeWidth={3.2} strokeLinecap="round" />
            </>
          )}
          {/* mouth */}
          {mood === 'bright' ? (
            <Path d={`M 68 ${eyeY + 16} Q 80 ${eyeY + 26} 92 ${eyeY + 16}`} stroke={colors.black} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          ) : mood === 'steady' ? (
            <Path d={`M 70 ${eyeY + 18} Q 80 ${eyeY + 23} 90 ${eyeY + 18}`} stroke={colors.black} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          ) : mood === 'tired' ? (
            <Path d={`M 71 ${eyeY + 20} L 89 ${eyeY + 20}`} stroke={colors.black} strokeWidth={3.2} strokeLinecap="round" />
          ) : (
            <Path d={`M 71 ${eyeY + 22} L 89 ${eyeY + 22}`} stroke={colors.cream} strokeWidth={3.2} strokeLinecap="round" />
          )}
          {/* feet */}
          <Rect x={x + 18} y={y + bodyH + 4} width={22} height={8} rx={4} fill={colors.line} />
          <Rect x={x + bodyW - 40} y={y + bodyH + 4} width={22} height={8} rx={4} fill={colors.line} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

export function moodLine(mood: VoltMood): string {
  switch (mood) {
    case 'bright':
      return 'Volt is fully charged.';
    case 'steady':
      return 'Volt is holding steady.';
    case 'tired':
      return 'Volt is running low.';
    case 'empty':
      return 'Volt is empty. The goal is crossed.';
  }
}
