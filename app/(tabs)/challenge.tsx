import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';
import ReAnimated, {
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Glyph from '@/components/Glyph';
import Volt from '@/components/Volt';
import { demoReelCountAdapter } from '@/services/reelCountAdapter';
import { selectToday, useStore } from '@/store/useStore';
import { colors, fonts, cardShadow } from '@/theme';
import { todayKey } from '@/utils';

const CHALLENGE_LINK = 'scrolltally.app/duel/volt-4821';

export default function Challenge() {
  const today = useStore(selectToday);
  const goal = useStore((s) => s.goal);
  const [sheet, setSheet] = useState(false);
  const friend = useMemo(() => demoReelCountAdapter.friendCountFor(todayKey()), []);
  const winning = today.total < friend.count;
  const tied = today.total === friend.count;

  // Lightning divider pulse.
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withSpring(1.16, { damping: 6, stiffness: 180 }),
        withSpring(1, { damping: 8, stiffness: 140 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [pulse]);
  const boltStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const share = async () => {
    try {
      await Share.share({
        message: `Duel me on ScrollTally. Fewer reels today wins. I am at ${today.total}. Join: ${CHALLENGE_LINK}`,
      });
    } catch {
      // share dismissed
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>DUEL ARENA</Text>
        <Text style={styles.title}>Fewer reels wins.</Text>
        <Text style={styles.sub}>A daily head-to-head. Whoever watches fewer short videos takes the day.</Text>

        <View style={styles.arena}>
          <ReAnimated.View entering={SlideInLeft.springify().damping(17)} style={styles.sideCard}>
            <Text style={styles.sideName}>YOU</Text>
            <Text style={[styles.sideCount, winning && { color: colors.sage }]}>{today.total}</Text>
            <Text style={styles.sideUnit}>reels today</Text>
            <Volt count={today.total} goal={goal} size={86} />
            <Text style={styles.mascotName}>Volt</Text>
          </ReAnimated.View>

          <View style={styles.divider}>
            <ReAnimated.View style={boltStyle}>
              <Svg width={30} height={120} viewBox="0 0 30 120">
                <Polygon points="17,4 7,52 14,52 11,116 24,44 16,44 22,4" fill={colors.amber} />
              </Svg>
            </ReAnimated.View>
            <View style={styles.vsChip}>
              <Text style={styles.vs}>VS</Text>
            </View>
          </View>

          <ReAnimated.View entering={SlideInRight.springify().damping(17)} style={styles.sideCard}>
            <Text style={styles.sideName}>{friend.name.toUpperCase()}</Text>
            <Text style={[styles.sideCount, !winning && !tied && { color: colors.sage }]}>{friend.count}</Text>
            <Text style={styles.sideUnit}>reels today</Text>
            <Volt count={friend.count} goal={goal} size={86} variant="juno" />
            <Text style={styles.mascotName}>Juno</Text>
          </ReAnimated.View>
        </View>

        <ReAnimated.View
          entering={FadeInUp.delay(220).springify().damping(15)}
          style={[styles.verdict, tied && styles.verdictTie, !winning && !tied && styles.verdictLose]}
        >
          <Text style={styles.verdictText}>
            {tied
              ? `Dead level at ${today.total} each. One more reel loses it.`
              : winning
                ? `You are ahead by ${friend.count - today.total}. Hold the line.`
                : `${friend.name} is ahead by ${today.total - friend.count} reels. The day is not over.`}
          </Text>
        </ReAnimated.View>

        <Pressable style={styles.challengeBtn} onPress={() => setSheet(true)}>
          <Glyph name="duel" size={19} color={colors.black} filled />
          <Text style={styles.challengeText}>Challenge a friend</Text>
        </Pressable>
        <Text style={styles.fine}>
          {friend.name} is a demo rival in this build. Real duels arrive with accounts in a later
          version.
        </Text>
      </ScrollView>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Your duel link</Text>
            <Text style={styles.sheetCopy}>Send it to a friend. Their count today against yours, winner takes the day.</Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText}>{CHALLENGE_LINK}</Text>
            </View>
            <Pressable style={styles.shareBtn} onPress={share}>
              <Glyph name="share" size={18} color={colors.black} />
              <Text style={styles.shareText}>Share the challenge</Text>
            </Pressable>
            <Pressable style={styles.closeBtn} onPress={() => setSheet(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 34 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.cream, marginTop: 6 },
  sub: { fontFamily: fonts.body, fontSize: 14.5, color: colors.muted, lineHeight: 21, marginTop: 8 },
  arena: { flexDirection: 'row', alignItems: 'stretch', marginTop: 20, gap: 2 },
  sideCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    ...cardShadow,
  },
  sideName: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 2, color: colors.creamDim },
  sideCount: { fontFamily: fonts.display, fontSize: 44, color: colors.cream, marginTop: 4 },
  sideUnit: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted },
  mascotName: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  divider: { alignItems: 'center', justifyContent: 'center', width: 42 },
  vsChip: { backgroundColor: colors.amber, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, marginTop: 6 },
  vs: { fontFamily: fonts.bodyBlack, fontSize: 11.5, color: colors.black },
  verdict: { borderRadius: 18, padding: 15, marginTop: 16, backgroundColor: colors.panel, borderColor: colors.sage, borderWidth: 1.5 },
  verdictTie: { borderColor: colors.amber },
  verdictLose: { borderColor: colors.rust },
  verdictText: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.cream, lineHeight: 20, textAlign: 'center' },
  challengeBtn: { flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.amber, borderRadius: 999, paddingVertical: 15, marginTop: 20 },
  challengeText: { fontFamily: fonts.bodyBlack, fontSize: 16, color: colors.black },
  fine: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 10, lineHeight: 17 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(7,11,20,0.72)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.panel, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 34 },
  sheetTitle: { fontFamily: fonts.displayBold, fontSize: 21, color: colors.cream },
  sheetCopy: { fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, lineHeight: 19, marginTop: 7 },
  linkBox: { backgroundColor: colors.panelAlt, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 14 },
  linkText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.amber, textAlign: 'center' },
  shareBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.amber, borderRadius: 999, paddingVertical: 14, marginTop: 14 },
  shareText: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.black },
  closeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  closeText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.creamDim },
});
