import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Animated as RNAnimated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';

import { QuestCard, StatusStrip, VoltChat } from '@/components/GameBits';
import { GoalRing } from '@/components/GoalRing';
import { EASE_OUT, useOnChange } from '@/components/motion';
import { PlatformChips } from '@/components/PlatformBits';
import { HubScene } from '@/components/Scene';
import Volt, { voltMood } from '@/components/Volt';
import { deriveProgress } from '@/game';
import { selectToday, selectYesterday, useStore } from '@/store/useStore';
import { colors, fonts } from '@/theme';
import { formatTimeSpent } from '@/utils';

export default function Today() {
  const router = useRouter();
  const goal = useStore((s) => s.goal);
  const history = useStore((s) => s.history);
  const today = useStore(selectToday);
  const yesterday = useStore(selectYesterday);
  const { mood } = voltMood(today.total, goal);
  const progress = deriveProgress(history, goal, today.total);
  const diff = today.total - yesterday.total;
  const remaining = Math.max(goal - today.total, 0);

  // Subtle tick on the hero number when today's count changes while this
  // screen is the one being looked at.
  const focusedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      return () => {
        focusedRef.current = false;
      };
    }, []),
  );
  const heroScale = useRef(new RNAnimated.Value(1)).current;
  const heroFade = useRef(new RNAnimated.Value(1)).current;
  useOnChange(today.total, () => {
    if (!focusedRef.current) return;
    RNAnimated.parallel([
      RNAnimated.sequence([
        RNAnimated.timing(heroScale, { toValue: 1.06, duration: 100, easing: EASE_OUT, useNativeDriver: false }),
        RNAnimated.timing(heroScale, { toValue: 1, duration: 160, easing: EASE_OUT, useNativeDriver: false }),
      ]),
      RNAnimated.sequence([
        RNAnimated.timing(heroFade, { toValue: 0.7, duration: 100, useNativeDriver: false }),
        RNAnimated.timing(heroFade, { toValue: 1, duration: 160, useNativeDriver: false }),
      ]),
    ]).start();
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.kicker}>SCROLLTALLY</Text>
          <Text style={styles.headSub}>Adventure hub · Today</Text>
        </View>

        <ReAnimated.View entering={FadeInUp.duration(420)}>
          <StatusStrip progress={progress} />
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInUp.delay(90).duration(420)} style={styles.heroCard}>
          <View style={styles.sceneWrap}>
            <View style={StyleSheet.absoluteFill}>
              <HubScene />
            </View>
            <View style={styles.heroCountWrap}>
              <RNAnimated.Text
                style={[styles.heroCount, { opacity: heroFade, transform: [{ scale: heroScale }] }]}
              >
                {today.total}
              </RNAnimated.Text>
              <Text style={styles.heroLabel}>reels today</Text>
            </View>
            <View style={styles.voltStage}>
              <Volt count={today.total} goal={goal} size={168} />
            </View>
            <View style={styles.ringBadge}>
              <GoalRing count={today.total} goal={goal} size={74} />
            </View>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{formatTimeSpent(today.total)}</Text>
              <Text style={styles.metaLabel}>time spent</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaValue, today.total > goal && { color: colors.rustSoft }]}>
                {today.total > goal ? `${today.total - goal} over` : `${remaining} left`}
              </Text>
              <Text style={styles.metaLabel}>of your {goal} goal</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {diff === 0 ? 'Same' : diff > 0 ? `+${diff}` : `${diff}`}
              </Text>
              <Text style={styles.metaLabel}>vs yesterday ({yesterday.total})</Text>
            </View>
          </View>
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInUp.delay(180).duration(420)}>
          <VoltChat mood={mood} total={today.total} goal={goal} />
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInUp.delay(260).duration(420)}>
          <QuestCard total={today.total} goal={goal} onPress={() => router.push('/(tabs)/feed')} />
        </ReAnimated.View>

        <Text style={styles.sectionTitle}>By platform</Text>
        <PlatformChips counts={today.byPlatform} />

        <Text style={styles.fine}>
          The feed is a demo. Each reel you swipe to adds to today's count, like the real thing
          will in the native build.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 34 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber },
  headSub: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
  heroCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#04070F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  sceneWrap: { height: 238, position: 'relative' },
  heroCountWrap: { position: 'absolute', top: 14, left: 16 },
  heroCount: { fontFamily: fonts.display, fontSize: 54, color: colors.cream, lineHeight: 58 },
  heroLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.creamDim },
  voltStage: { position: 'absolute', left: 0, right: 0, bottom: 2, alignItems: 'center' },
  ringBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    padding: 5,
  },
  heroMeta: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 14, gap: 8 },
  metaItem: { flex: 1 },
  metaValue: { fontFamily: fonts.bodyBlack, fontSize: 16.5, color: colors.cream },
  metaLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream, marginTop: 22, marginBottom: 10 },
  fine: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 14, lineHeight: 17 },
});
