import { StyleSheet, Text, View } from 'react-native';

import PlatformIcon from './PlatformIcon';
import { PlatformCounts, PLATFORMS } from '../types';
import { colors, fonts } from '../theme';

export function PlatformChips({ counts }: { counts: PlatformCounts }) {
  return (
    <View style={styles.row}>
      {PLATFORMS.map((p) => (
        <View key={p.id} style={styles.chip}>
          <PlatformIcon id={p.id} size={30} />
          <View>
            <Text style={styles.count}>{counts[p.id]}</Text>
            <Text style={styles.label}>{p.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function PlatformBars({ counts }: { counts: PlatformCounts }) {
  const max = Math.max(1, ...PLATFORMS.map((p) => counts[p.id]));
  return (
    <View style={{ gap: 12 }}>
      {PLATFORMS.map((p) => (
        <View key={p.id}>
          <View style={styles.barHead}>
            <View style={styles.barHeadLeft}>
              <PlatformIcon id={p.id} size={20} />
              <Text style={styles.barLabel}>{p.label}</Text>
            </View>
            <Text style={styles.barCount}>{counts[p.id]}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(counts[p.id] / max) * 100}%`, backgroundColor: p.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 11,
    minWidth: '47%',
    flexGrow: 1,
  },
  count: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream },
  label: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  barHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.creamDim },
  barCount: { fontFamily: fonts.bodyBlack, fontSize: 13, color: colors.cream },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.bgDeep, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});
