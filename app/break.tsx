import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import Volt from '@/components/Volt';
import { selectToday, useStore } from '@/store/useStore';
import { colors, fonts } from '@/theme';
import { formatTimeSpent } from '@/utils';

const BREAK_SECONDS = 60;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = 264;
const RING_STROKE = 12;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

export default function BreakScreen() {
  const router = useRouter();
  const today = useStore(selectToday);
  const goal = useStore((s) => s.goal);
  const [secondsLeft, setSecondsLeft] = useState(BREAK_SECONDS);
  const done = secondsLeft <= 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // Volt visibly recharges during the break: his virtual count eases from
  // the goal (empty) back toward zero (full) as the cooldown runs down.
  const recharged = 1 - secondsLeft / BREAK_SECONDS;
  const virtualCount = Math.round(goal * (1 - recharged));

  // Countdown ring: drains smoothly from full to empty across the break.
  const drain = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.timing(drain, {
      toValue: 0,
      duration: BREAK_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [drain]);
  const ringOffset = drain.interpolate({ inputRange: [0, 1], outputRange: [RING_C, 0] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.kicker}>COOLDOWN</Text>

        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={colors.panel}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={done ? colors.sage : colors.amber}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={`${RING_C}`}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <Volt count={virtualCount} goal={goal} size={128} />
          {!done ? (
            <Text style={styles.timer}>
              {mm}:{ss}
            </Text>
          ) : (
            <Text style={styles.ringDone}>Full</Text>
          )}
        </View>

        <Text style={styles.title}>{done ? 'Break complete.' : 'Volt is recharging.'}</Text>
        <Text style={styles.copy}>
          {today.total} reels today, about {formatTimeSpent(today.total)} of scrolling. This
          shield is a demo: in the native build it will sit over the feeds themselves.
        </Text>
        {done ? (
          <Text style={styles.doneLine}>Charge restored. The count is still there when you get back.</Text>
        ) : null}
        <Pressable style={styles.exit} onPress={() => router.back()}>
          <Text style={styles.exitText}>{done ? 'Back to ScrollTally' : 'End break early'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDeep },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 12.5, letterSpacing: 3, color: colors.amber, marginBottom: 22 },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { fontFamily: fonts.display, fontSize: 34, color: colors.amber, marginTop: -16 },
  ringDone: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.sage, marginTop: -10 },
  title: { fontFamily: fonts.display, fontSize: 29, color: colors.cream, textAlign: 'center', marginTop: 20 },
  copy: { fontFamily: fonts.body, fontSize: 14.5, color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  doneLine: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.sage, textAlign: 'center', marginTop: 16, lineHeight: 21 },
  exit: { backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28, marginTop: 28 },
  exitText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.cream },
});
