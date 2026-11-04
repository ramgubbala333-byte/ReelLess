import { StyleSheet, Text, View } from 'react-native';

import { PlatformCounts, PLATFORMS } from '../types';
import { colors, fonts } from '../theme';

export function PlatformChips({ counts }: { counts: PlatformCounts }) {
  return (
    <View style={styles.row}>
      {PLATFORMS.map((p) => (
        <View key={p.id} style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: p.color }]}>
            <Text style={styles.dotText}>{p.short}</Text>
          </View>
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
            <Text style={styles.barLabel}>{p.label}</Text>
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
  dot: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: fonts.bodyBlack, fontSize: 10, color: colors.black },
  count: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream },
  label: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.creamDim },
  barCount: { fontFamily: fonts.bodyBlack, fontSize: 13, color: colors.cream },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.bgDeep, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});
