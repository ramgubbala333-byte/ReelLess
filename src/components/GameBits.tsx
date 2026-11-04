import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Badge, Progress } from '../game';
import { colors, fonts } from '../theme';
import Glyph from './Glyph';
import Volt, { moodLine, VoltMood } from './Volt';

/** XP bar: springs to the new fraction; a shine sweep runs across it. */
export function XpBar({ frac }: { frac: number }) {
  const fill = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    fill.value = withSpring(frac, { damping: 16, stiffness: 90 });
  }, [frac, fill]);

  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600 }),
        withTiming(1, { duration: 1400 }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [shine]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, fill.value)) * 100}%`,
  }));
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -30 + shine.value * 260 }, { rotate: '18deg' }],
    opacity: 0.08 + shine.value * 0.2,
  }));

  return (
    <View style={styles.xpTrack}>
      <Animated.View style={[styles.xpFill, fillStyle]} />
      <Animated.View pointerEvents="none" style={[styles.xpShine, shineStyle]} />
    </View>
  );
}

/** Energy hearts: pop as a row whenever the filled count changes. */
export function Hearts({ filled, total }: { filled: number; total: number }) {
  const pop = useSharedValue(1);
  useEffect(() => {
    pop.value = withSequence(
      withSpring(1.18, { damping: 8, stiffness: 220 }),
      withSpring(1, { damping: 10, stiffness: 160 }),
    );
  }, [filled, pop]);
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Animated.View style={[styles.heartsRow, rowStyle]}>
      {Array.from({ length: total }).map((_, i) => (
        <Glyph
          key={i}
          name="heart"
          size={17}
          color={i < filled ? colors.rustSoft : colors.muted}
          filled={i < filled}
        />
      ))}
    </Animated.View>
  );
}

/** Top status strip: mascot name, level, star + XP bar, energy hearts. */
export function StatusStrip({ progress }: { progress: Progress }) {
  return (
    <View style={styles.strip}>
      <View style={styles.stripTop}>
        <View style={styles.avatarBadge}>
          <Volt count={0} goal={100} size={40} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stripName}>Volt</Text>
          <Text style={styles.stripLevel}>Level {progress.level} · Charge Keeper</Text>
        </View>
        <Hearts filled={progress.heartsFilled} total={progress.heartsTotal} />
      </View>
      <View style={styles.xpRow}>
        <Glyph name="star" size={16} color={colors.star} filled />
        <View style={{ flex: 1 }}>
          <XpBar frac={progress.xpFrac} />
        </View>
        <Text style={styles.xpText}>
          {progress.questsCompleted} quests · {progress.questsToNextLevel} to Level{' '}
          {progress.level + 1}
        </Text>
      </View>
    </View>
  );
}

/** Story-style chat: Volt sends bubbles that react to the live state. */
export function VoltChat({
  mood,
  total,
  goal,
}: {
  mood: VoltMood;
  total: number;
  goal: number;
}) {
  const remaining = Math.max(goal - total, 0);
  const bubbles: string[] = [moodLine(mood)];
  if (total === 0) {
    bubbles.push('No reels yet today. The trail is quiet and my charge is full.');
  } else if (total > goal) {
    bubbles.push(`That is ${total - goal} past the goal. A break would top me back up.`);
  } else {
    bubbles.push(`${remaining} reels left in today's quest. Spend them well.`);
  }
  if (mood === 'bright') {
    bubbles.push('Keep this pace and we finish the day with charge to spare.');
  } else if (mood === 'tired') {
    bubbles.push('I am fading. Fewer reels from here keeps me lit.');
  }

  return (
    <View style={styles.chatCard}>
      <Text style={styles.chatTitle}>Volt says</Text>
      {bubbles.map((b, i) => (
        <Animated.View
          key={`${mood}-${total > goal}-${i}`}
          entering={FadeInLeft.delay(120 + i * 140).duration(320)}
          style={styles.chatRow}
        >
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>V</Text>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{b}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

/** Today's quest prompt card with the big orange journey CTA. */
export function QuestCard({
  total,
  goal,
  onPress,
}: {
  total: number;
  goal: number;
  onPress: () => void;
}) {
  const over = total > goal;
  const frac = goal <= 0 ? 1 : Math.min(total / goal, 1);
  return (
    <View style={styles.questCard}>
      <View style={styles.questHead}>
        <Glyph name="star" size={17} color={colors.star} filled />
        <Text style={styles.questTitle}>Today's quest</Text>
      </View>
      <Text style={styles.questBody}>
        Stay under {goal} reels. {total} counted so far{over ? ' — quest failed for today, tomorrow resets it.' : '.'}
      </Text>
      <View style={styles.questTrack}>
        <View
          style={[
            styles.questFill,
            { width: `${Math.round(frac * 100)}%`, backgroundColor: over ? colors.rust : colors.amber },
          ]}
        />
      </View>
      <Pressable style={styles.questCta} onPress={onPress}>
        <Glyph name="play" size={16} color={colors.black} />
        <Text style={styles.questCtaText}>Continue the journey</Text>
      </Pressable>
    </View>
  );
}

/** Achievement badge card: unlocked vs locked (padlock + condition). */
export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View style={[styles.badge, badge.unlocked ? styles.badgeOn : styles.badgeOff]}>
      <View style={[styles.badgeIcon, badge.unlocked ? styles.badgeIconOn : styles.badgeIconOff]}>
        <Glyph
          name={badge.unlocked ? 'star' : 'lock'}
          size={19}
          color={badge.unlocked ? colors.star : colors.muted}
          filled={badge.unlocked}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.badgeTitle, !badge.unlocked && { color: colors.muted }]}>
          {badge.title}
        </Text>
        <Text style={styles.badgeCond}>
          {badge.unlocked ? 'Unlocked' : badge.condition}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    shadowColor: '#04070F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  stripTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.panelAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripName: { fontFamily: fonts.bodyBlack, fontSize: 17, color: colors.cream },
  stripLevel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted, marginTop: 1 },
  heartsRow: { flexDirection: 'row', gap: 3 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  xpTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
    position: 'relative',
  },
  xpFill: { height: '100%', borderRadius: 6, backgroundColor: colors.star },
  xpShine: {
    position: 'absolute',
    top: -6,
    bottom: -6,
    width: 11,
    backgroundColor: '#FFFFFF',
  },
  xpText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.muted },
  chatCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  chatTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream, marginBottom: 12 },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 10 },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: { fontFamily: fonts.bodyBlack, fontSize: 14, color: colors.black },
  bubble: {
    flex: 1,
    backgroundColor: colors.panelAlt,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  bubbleText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream, lineHeight: 19 },
  questCard: {
    backgroundColor: colors.panel,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  questHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  questTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream },
  questBody: { fontFamily: fonts.body, fontSize: 13.5, color: colors.creamDim, lineHeight: 19, marginTop: 7 },
  questTrack: { height: 10, borderRadius: 5, backgroundColor: colors.bgDeep, overflow: 'hidden', marginTop: 12 },
  questFill: { height: '100%', borderRadius: 5 },
  questCta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber,
    borderRadius: 999,
    paddingVertical: 13,
    marginTop: 14,
  },
  questCtaText: { fontFamily: fonts.bodyBlack, fontSize: 15.5, color: colors.black },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
  },
  badgeOn: { backgroundColor: colors.panelAlt, borderColor: colors.star },
  badgeOff: { backgroundColor: colors.panel, borderColor: colors.line },
  badgeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badgeIconOn: { backgroundColor: colors.bgDeep },
  badgeIconOff: { backgroundColor: colors.bgDeep },
  badgeTitle: { fontFamily: fonts.bodyBlack, fontSize: 14.5, color: colors.cream },
  badgeCond: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
});
