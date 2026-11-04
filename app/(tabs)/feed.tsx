import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, {
  Easing,
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Glyph from '@/components/Glyph';
import PlatformIcon from '@/components/PlatformIcon';
import { EASE_OUT, useOnChange } from '@/components/motion';
import { ReelScene, sceneForCard } from '@/components/Scene';
import { ReelCard, buildReelDeck } from '@/data';
import { selectToday, useStore } from '@/store/useStore';
import { PLATFORMS } from '@/types';
import { colors, fonts } from '@/theme';
import { todayKey } from '@/utils';

export default function Feed() {
  const incrementReel = useStore((s) => s.incrementReel);
  const platforms = useStore((s) => s.platforms);
  const today = useStore(selectToday);
  const goal = useStore((s) => s.goal);
  const listRef = useRef<FlatList<ReelCard>>(null);
  const lastCounted = useRef(-1);
  const [height, setHeight] = useState(0);
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const deck = useMemo(() => {
    const all = buildReelDeck(80, `deck-${todayKey()}`);
    const enabled = all.filter((c) => platforms[c.platform]);
    return enabled.length > 0 ? enabled : all;
  }, [platforms]);

  // Parallax: the scene layer inside each slide drifts against the page
  // direction on the UI thread while paging.
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const countIndex = (index: number) => {
    if (index === lastCounted.current || index < 0 || index >= deck.length) return;
    lastCounted.current = index;
    setCurrent(index);
    incrementReel(deck[index].platform);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (height <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.y / height);
    countIndex(index);
  };

  const goNext = () => {
    const next = Math.min(current + 1, deck.length - 1);
    countIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const over = today.total > goal;

  // Count feedback: every increment pops the number and flashes the pill
  // border amber. Over goal the resting border is rust and the pop is
  // slightly stronger. (Spark burst below is the Reanimated layer.)
  const pop = useRef(new RNAnimated.Value(1)).current;
  const flash = useRef(new RNAnimated.Value(0)).current;
  useOnChange(today.total, () => {
    RNAnimated.sequence([
      RNAnimated.timing(pop, { toValue: over ? 1.26 : 1.18, duration: 90, easing: EASE_OUT, useNativeDriver: false }),
      RNAnimated.timing(pop, { toValue: 1, duration: 150, easing: EASE_OUT, useNativeDriver: false }),
    ]).start();
    RNAnimated.sequence([
      RNAnimated.timing(flash, { toValue: 1, duration: 70, useNativeDriver: false }),
      RNAnimated.timing(flash, { toValue: 0, duration: 240, useNativeDriver: false }),
    ]).start();
  });
  const pillBorder = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [over ? colors.rust : colors.line, colors.amber],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View
        style={styles.feedWrap}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && height === 0) {
            setHeight(h);
            countIndex(0);
          }
        }}
      >
        {height > 0 ? (
          <ReAnimated.FlatList
            ref={listRef}
            data={deck}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            decelerationRate="fast"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onMomentumScrollEnd={onMomentumEnd}
            getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
            renderItem={({ item, index }) => (
              <ReelSlide
                card={item}
                index={index}
                height={height}
                scrollY={scrollY}
                liked={!!liked[item.id]}
                onLike={() => setLiked((l) => ({ ...l, [item.id]: !l[item.id] }))}
              />
            )}
          />
        ) : null}

        {/* floating count pill + spark burst */}
        <View pointerEvents="none" style={styles.pillWrap}>
          <View style={styles.pillAnchor}>
            <SparkBurst triggerKey={today.total} />
            <RNAnimated.View style={[styles.pill, { borderColor: pillBorder }]}>
              <Glyph name="bolt" size={16} color={over ? colors.rustSoft : colors.amber} />
              <RNAnimated.Text style={[styles.pillText, { transform: [{ scale: pop }] }]}>
                {today.total} reels today
              </RNAnimated.Text>
              <Text style={styles.pillGoal}>/ {goal}</Text>
            </RNAnimated.View>
          </View>
        </View>

        <Pressable style={styles.nextBtn} onPress={goNext} accessibilityLabel="Next reel">
          <Glyph name="down" size={22} color={colors.black} />
        </Pressable>
      </View>
      <Text style={styles.demoBar}>Demo feed. Every reel you land on is counted, in real time.</Text>
    </SafeAreaView>
  );
}

/** Six small bolts radiate from the pill on every counted reel. */
function SparkBurst({ triggerKey }: { triggerKey: number }) {
  const burst = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    burst.value = 0;
    burst.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.quad) });
  }, [triggerKey, burst]);

  return (
    <View pointerEvents="none" style={styles.burstAnchor}>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <SparkBolt key={deg} deg={deg} burst={burst} />
      ))}
    </View>
  );
}

function SparkBolt({ deg, burst }: { deg: number; burst: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const rad = (deg * Math.PI) / 180;
    const dist = 14 + burst.value * 40;
    return {
      opacity: 1 - burst.value,
      transform: [
        { translateX: Math.cos(rad) * dist },
        { translateY: Math.sin(rad) * dist },
        { scale: 1 - burst.value * 0.45 },
      ],
    };
  });
  return (
    <ReAnimated.View style={[styles.bolt, style]}>
      <Glyph name="bolt" size={13} color={colors.amberSoft} />
    </ReAnimated.View>
  );
}

function ReelSlide({
  card,
  index,
  height,
  scrollY,
  liked,
  onLike,
}: {
  card: ReelCard;
  index: number;
  height: number;
  scrollY: SharedValue<number>;
  liked: boolean;
  onLike: () => void;
}) {
  const platform = PLATFORMS.find((p) => p.id === card.platform);
  const sceneStyle = useAnimatedStyle(() => {
    const offset = scrollY.value - index * height;
    const ty = interpolate(offset, [-height, 0, height], [-26, 0, 26], Extrapolation.CLAMP);
    return { transform: [{ translateY: ty }] };
  });

  return (
    <View style={[styles.slide, { height }]}>
      <ReAnimated.View style={[styles.sceneLayer, sceneStyle]}>
        <ReelScene kind={sceneForCard(card.id)} />
      </ReAnimated.View>

      <View style={styles.levelChip}>
        <Text style={styles.levelChipText}>Level {index + 1}</Text>
      </View>

      <View style={styles.slideCenter}>
        <Text style={styles.topic}>{card.topic}</Text>
        <View style={styles.playCircle}>
          <Glyph name="play" size={30} color={colors.cream} />
        </View>
        <Text style={styles.slideHint}>Simulated reel</Text>
      </View>

      <View style={styles.slideBottom}>
        <View style={{ flex: 1 }}>
          <View style={styles.handleRow}>
            <PlatformIcon id={card.platform} size={26} />
            <Text style={styles.handle}>{card.handle}</Text>
          </View>
          <Text style={styles.caption}>{card.caption}</Text>
          <Text style={styles.platformLine}>{platform?.label} · counted by ScrollTally</Text>
        </View>
        <View style={styles.rail}>
          <Pressable onPress={onLike} style={styles.railItem}>
            <Glyph name="heart" size={26} color={liked ? colors.rustSoft : colors.cream} filled={liked} />
            <Text style={styles.railText}>{card.likes}</Text>
          </Pressable>
          <View style={styles.railItem}>
            <Glyph name="comment" size={24} color={colors.cream} />
            <Text style={styles.railText}>{card.comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  feedWrap: { flex: 1, position: 'relative' },
  demoBar: {
    fontFamily: fonts.bodySemi,
    fontSize: 11.5,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 7,
    backgroundColor: colors.bgDeep,
  },
  pillWrap: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
  pillAnchor: { position: 'relative', alignItems: 'center' },
  burstAnchor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolt: { position: 'absolute', left: -7, top: -7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
    shadowColor: '#04070F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  pillText: { fontFamily: fonts.bodyBlack, fontSize: 14.5, color: colors.cream },
  pillGoal: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted },
  nextBtn: {
    position: 'absolute',
    right: 14,
    bottom: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#04070F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  slide: { width: '100%', backgroundColor: colors.bgDeep, overflow: 'hidden' },
  sceneLayer: { position: 'absolute', left: 0, right: 0, top: -34, bottom: -34 },
  levelChip: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.amber,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  levelChipText: { fontFamily: fonts.bodyBlack, fontSize: 11.5, color: colors.black },
  slideCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  topic: { fontFamily: fonts.display, fontSize: 34, color: colors.cream, textAlign: 'center', paddingHorizontal: 30 },
  playCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: colors.cream,
    backgroundColor: 'rgba(13,21,38,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  slideHint: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 2, color: colors.cream, opacity: 0.85 },
  slideBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 18,
    paddingRight: 76,
    gap: 12,
    backgroundColor: 'rgba(10,17,32,0.88)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  handle: { fontFamily: fonts.bodyBlack, fontSize: 15.5, color: colors.cream },
  caption: { fontFamily: fonts.body, fontSize: 14.5, color: colors.creamDim, lineHeight: 20 },
  platformLine: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.muted, marginTop: 7 },
  rail: { alignItems: 'center', gap: 16 },
  railItem: { alignItems: 'center', gap: 3 },
  railText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream },
});
