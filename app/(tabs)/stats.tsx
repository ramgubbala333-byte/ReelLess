import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';

import { BadgeCard } from '@/components/GameBits';
import { PlatformBars } from '@/components/PlatformBits';
import { WeekChart } from '@/components/WeekChart';
import { deriveBadges } from '@/game';
import { useStore } from '@/store/useStore';
import { DayRecord, emptyPlatformCounts } from '@/types';
import { colors, fonts, cardShadow } from '@/theme';
import { dateKey, formatTimeSpent, prettyDate } from '@/utils';

function lastDays(history: Record<string, DayRecord>, n: number): DayRecord[] {
  const out: DayRecord[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    out.push(history[key] ?? { date: key, total: 0, byPlatform: emptyPlatformCounts() });
  }
  return out;
}

export default function Stats() {
  const history = useStore((s) => s.history);
  const goal = useStore((s) => s.goal);
  const { width } = useWindowDimensions();

  const week = useMemo(() => lastDays(history, 7), [history]);
  const today = week[week.length - 1];
  const yesterday = week[week.length - 2];
  const weekTotal = week.reduce((a, d) => a + d.total, 0);
  const allDays = Object.values(history);
  const allTime = allDays.reduce((a, d) => a + d.total, 0);
  const pastDays = allDays.filter((d) => d.date !== today.date && d.total > 0);
  const bestDay = pastDays.length
    ? pastDays.reduce((a, d) => (d.total < a.total ? d : a), pastDays[0])
    : null;
  const badges = useMemo(() => deriveBadges(history, goal), [history, goal]);

  const weekPlatforms = emptyPlatformCounts();
  week.forEach((d) => {
    (Object.keys(weekPlatforms) as Array<keyof typeof weekPlatforms>).forEach((k) => {
      weekPlatforms[k] += d.byPlatform[k];
    });
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>STATS</Text>
        <Text style={styles.title}>Your week in reels</Text>

        <ReAnimated.View entering={FadeInUp.duration(420)} style={styles.card}>
          <WeekChart days={week} goal={goal} width={Math.min(width - 76, 380)} />
        </ReAnimated.View>

        <View style={styles.totalsRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{today.total}</Text>
            <Text style={styles.totalLabel}>Today</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{yesterday.total}</Text>
            <Text style={styles.totalLabel}>Yesterday</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{weekTotal}</Text>
            <Text style={styles.totalLabel}>This week</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{allTime}</Text>
            <Text style={styles.totalLabel}>All time</Text>
          </View>
        </View>

        <Text style={styles.timeLine}>
          This week adds up to about {formatTimeSpent(weekTotal)} of short video.
        </Text>

        <Text style={styles.sectionTitle}>Platforms this week</Text>
        <View style={styles.card}>
          <PlatformBars counts={weekPlatforms} />
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>
        <View>
          {badges.map((b, i) => (
            <ReAnimated.View key={b.id} entering={FadeInUp.delay(i * 70).duration(380)}>
              <BadgeCard badge={b} />
            </ReAnimated.View>
          ))}
        </View>

        {bestDay ? (
          <View style={[styles.card, styles.bestCard]}>
            <Text style={styles.bestTitle}>Lightest day</Text>
            <Text style={styles.bestBody}>
              {prettyDate(bestDay.date)}: only {bestDay.total} reels. Proof a quiet day is
              possible.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 34 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.cream, marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 24, padding: 16, ...cardShadow },
  totalsRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  totalCard: { flex: 1, backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 18, paddingVertical: 13, alignItems: 'center' },
  totalValue: { fontFamily: fonts.displayBold, fontSize: 21, color: colors.cream },
  totalLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.muted, marginTop: 3 },
  timeLine: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.creamDim, marginTop: 16, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream, marginTop: 22, marginBottom: 10 },
  bestCard: { marginTop: 16, borderColor: colors.sage },
  bestTitle: { fontFamily: fonts.bodyBlack, fontSize: 14.5, color: colors.sage },
  bestBody: { fontFamily: fonts.body, fontSize: 13.5, color: colors.creamDim, lineHeight: 19, marginTop: 5 },
});
