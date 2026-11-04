import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';

import Glyph from '@/components/Glyph';
import Volt from '@/components/Volt';
import { selectToday, useStore } from '@/store/useStore';
import { PLATFORMS } from '@/types';
import { colors, fonts, cardShadow } from '@/theme';

const GOAL_PRESETS = [25, 50, 100, 150, 200];

export default function Settings() {
  const router = useRouter();
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const platforms = useStore((s) => s.platforms);
  const togglePlatform = useStore((s) => s.togglePlatform);
  const resetDemo = useStore((s) => s.resetDemo);
  const exportJson = useStore((s) => s.exportJson);
  const today = useStore(selectToday);
  const [exported, setExported] = useState(false);

  const doExport = async () => {
    try {
      await Share.share({ message: exportJson() });
      setExported(true);
    } catch {
      // dismissed
    }
  };

  const doReset = () => {
    Alert.alert('Reset demo data?', 'Seeded history is regenerated and today goes back to zero.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetDemo },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>SETTINGS</Text>
        <Text style={styles.title}>Your count, your rules</Text>

        <Text style={styles.sectionTitle}>Daily reel goal</Text>
        <ReAnimated.View entering={FadeInUp.duration(380)} style={styles.card}>
          <View style={styles.goalRow}>
            <Pressable style={styles.stepper} onPress={() => setGoal(goal - 10)}>
              <Text style={styles.stepperText}>−10</Text>
            </Pressable>
            <Text style={styles.goalNumber}>{goal}</Text>
            <Pressable style={styles.stepper} onPress={() => setGoal(goal + 10)}>
              <Text style={styles.stepperText}>+10</Text>
            </Pressable>
          </View>
          <View style={styles.presetRow}>
            {GOAL_PRESETS.map((g) => (
              <Pressable key={g} onPress={() => setGoal(g)} style={[styles.preset, goal === g && styles.presetOn]}>
                <Text style={[styles.presetText, goal === g && styles.presetTextOn]}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.cardNote}>Volt empties and a statement screen appears when you cross it.</Text>
        </ReAnimated.View>

        <Text style={styles.sectionTitle}>Platforms counted</Text>
        <View style={styles.card}>
          {PLATFORMS.map((p, i) => (
            <View key={p.id} style={[styles.toggleRow, i > 0 && styles.toggleBorder]}>
              <View style={[styles.pMark, { backgroundColor: p.color }]}>
                <Text style={styles.pMarkText}>{p.short}</Text>
              </View>
              <Text style={styles.toggleLabel}>{p.label}</Text>
              <Switch
                value={platforms[p.id]}
                onValueChange={() => togglePlatform(p.id)}
                trackColor={{ false: colors.line, true: colors.amber }}
                thumbColor={colors.cream}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Home-screen widget</Text>
        <View style={styles.widgetCard}>
          <View style={styles.widgetHead}>
            <Glyph name="bolt" size={15} color={colors.amber} />
            <Text style={styles.widgetApp}>REELESS</Text>
          </View>
          <View style={styles.widgetRow}>
            <Text style={styles.widgetCount}>{today.total}</Text>
            <View>
              <Text style={styles.widgetLabel}>Reels today</Text>
              <Text style={styles.widgetSub}>Goal {goal} · Volt {today.total > goal ? 'empty' : 'charged'}</Text>
            </View>
            <View style={{ marginLeft: 'auto' }}>
              <Volt count={today.total} goal={goal} size={64} />
            </View>
          </View>
          <Text style={styles.cardNote}>
            Preview only. The live home-screen widget ships with the native build (roadmap item 1).
          </Text>
        </View>

        <Text style={styles.sectionTitle}>ReelLess PRO</Text>
        <Pressable style={styles.proCard} onPress={() => router.push('/paywall')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>See what PRO adds</Text>
            <Text style={styles.proSub}>Paywall is off in v1. Everything here is free right now.</Text>
          </View>
          <Glyph name="down" size={19} color={colors.amber} />
        </Pressable>

        <Text style={styles.sectionTitle}>Your data</Text>
        <View style={styles.card}>
          <Pressable style={styles.actionRow} onPress={doExport}>
            <Text style={styles.actionLabel}>Export my data (JSON)</Text>
            <Glyph name="share" size={18} color={colors.amber} />
          </Pressable>
          {exported ? <Text style={styles.cardNote}>Export opened. Your data never leaves your phone unless you share it.</Text> : null}
          <Pressable style={[styles.actionRow, styles.toggleBorder]} onPress={doReset}>
            <Text style={[styles.actionLabel, { color: colors.rustSoft }]}>Reset demo data</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>About this build</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            ReelLess v1 runs on a demo counting adapter. The Reels feed inside the app is
            simulated, and each reel you land on is counted for real. Past days are seeded demo
            history, regenerated if you reset.
          </Text>
          <Text style={styles.aboutText}>
            Live counting across Instagram, YouTube, Facebook and Snapchat needs the native build:
            an Android Accessibility overlay for the floating count, and iOS Screen Time
            frameworks on Apple devices. Blocking, the home-screen widget and friend duels are on
            the same roadmap.
          </Text>
          <Text style={styles.aboutText}>Your counts are stored only on this device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 38 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.cream, marginTop: 6 },
  sectionTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 24, padding: 16, ...cardShadow },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { backgroundColor: colors.panelAlt, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18 },
  stepperText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.cream },
  goalNumber: { fontFamily: fonts.display, fontSize: 52, color: colors.cream },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  preset: { borderRadius: 999, borderWidth: 1.5, borderColor: colors.line, paddingVertical: 8, paddingHorizontal: 15 },
  presetOn: { backgroundColor: colors.amber, borderColor: colors.amber },
  presetText: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.creamDim },
  presetTextOn: { color: colors.black },
  cardNote: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 },
  toggleBorder: { borderTopColor: colors.line, borderTopWidth: 1 },
  pMark: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pMarkText: { fontFamily: fonts.bodyBlack, fontSize: 11, color: colors.black },
  toggleLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream, flex: 1 },
  widgetCard: { backgroundColor: colors.bgDeep, borderColor: colors.line, borderWidth: 1, borderRadius: 24, padding: 16 },
  widgetHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  widgetApp: { fontFamily: fonts.bodyBlack, fontSize: 11, letterSpacing: 2, color: colors.muted },
  widgetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  widgetCount: { fontFamily: fonts.display, fontSize: 44, color: colors.cream },
  widgetLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.cream },
  widgetSub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 2 },
  proCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.panel, borderColor: colors.amber, borderWidth: 1.5, borderRadius: 24, padding: 16 },
  proTitle: { fontFamily: fonts.bodyBlack, fontSize: 16, color: colors.cream },
  proSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 3 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  actionLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  aboutText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.creamDim, lineHeight: 20, marginBottom: 10 },
});
