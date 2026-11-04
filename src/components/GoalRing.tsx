import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '../theme';
import { useAnimatedNumber } from './motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function GoalRing({
  count,
  goal,
  size = 92,
}: {
  count: number;
  goal: number;
  size?: number;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = goal <= 0 ? 1 : Math.min(count / goal, 1);
  const over = count > goal;

  // Sweep animates to the new fraction over ~600ms instead of jumping.
  const animPct = useAnimatedNumber(pct, 600);
  const dashOffset = animPct.interpolate({
    inputRange: [0, 1],
    outputRange: [c, 0],
  });

  // Keep the centre label in step with the sweep (only re-render on a
  // whole-percent change).
  const [shownPct, setShownPct] = useState(pct);
  useEffect(() => {
    const id = animPct.addListener(({ value }) => {
      setShownPct((prev) => (Math.round(prev * 100) === Math.round(value * 100) ? prev : value));
    });
    return () => animPct.removeListener(id);
  }, [animPct]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? colors.rust : colors.amber}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.pct}>{Math.round(shownPct * 100)}%</Text>
        <Text style={styles.of}>of goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pct: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.cream },
  of: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },
});
