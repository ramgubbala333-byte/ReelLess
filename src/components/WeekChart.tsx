import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { DayRecord } from '../types';
import { colors, fonts } from '../theme';
import { dayLabel } from '../utils';
import { EASE_OUT } from './motion';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function WeekChart({
  days,
  goal,
  width = 320,
  height = 150,
}: {
  days: DayRecord[];
  goal: number;
  width?: number;
  height?: number;
}) {
  const max = Math.max(goal, ...days.map((d) => d.total), 10);
  const chartH = height - 34;
  const barW = Math.floor((width - 24) / days.length) - 12;
  const step = (width - 16) / days.length;
  const goalY = chartH - (goal / max) * (chartH - 14);

  // Bars grow from the baseline on mount (and regrow if the week changes),
  // staggered left to right.
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    grow.setValue(0);
    const anim = Animated.timing(grow, {
      toValue: 1,
      duration: 850,
      easing: EASE_OUT,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [grow, days]);

  return (
    <View>
      <Svg width={width} height={chartH + 4}>
        <Line x1={4} y1={goalY} x2={width - 4} y2={goalY} stroke={colors.amber} strokeWidth={1.4} strokeDasharray="5 5" />
        {days.map((d, i) => {
          const fullH = Math.max(3, (d.total / max) * (chartH - 14));
          const x = 8 + i * step + (step - barW) / 2;
          const over = d.total > goal;
          const start = i * 0.07;
          const h = grow.interpolate({
            inputRange: [start, Math.min(start + 0.55, 1)],
            outputRange: [0, fullH],
            extrapolate: 'clamp',
          });
          const y = grow.interpolate({
            inputRange: [start, Math.min(start + 0.55, 1)],
            outputRange: [chartH, chartH - fullH],
            extrapolate: 'clamp',
          });
          return (
            <AnimatedRect
              key={d.date}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={5}
              fill={over ? colors.rust : colors.amber}
              opacity={i === days.length - 1 ? 1 : 0.72}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {days.map((d) => (
          <Text key={d.date} style={[styles.label, { width: step }]}>
            {dayLabel(d.date)}
          </Text>
        ))}
      </View>
      <Text style={styles.note}>Dashed line is your daily goal of {goal}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', paddingLeft: 8 },
  label: { fontFamily: fonts.bodySemi, fontSize: 10.5, color: colors.muted, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 6 },
});
