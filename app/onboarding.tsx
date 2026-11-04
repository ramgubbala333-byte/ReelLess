import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, { FadeInRight } from 'react-native-reanimated';

import Glyph from '@/components/Glyph';
import PlatformIcon from '@/components/PlatformIcon';
import { HubScene } from '@/components/Scene';
import Volt from '@/components/Volt';
import { useStore } from '@/store/useStore';
import { PLATFORMS, PlatformId } from '@/types';
import { colors, fonts, cardShadow } from '@/theme';

const GOAL_PRESETS = [25, 50, 100, 150, 200];

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [platforms, setPlatforms] = useState<Record<PlatformId, boolean>>({
    instagram: true,
    youtube: true,
    facebook: true,
    snapchat: true,
  });
  const [goal, setGoal] = useState(100);

  const toggle = (id: PlatformId) => setPlatforms((p) => ({ ...p, [id]: !p[id] }));
  const anyPlatform = Object.values(platforms).some(Boolean);

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding(goal, platforms);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <ReAnimated.View key={step} entering={FadeInRight.duration(340)}>
          {step === 0 && (
            <View>
              <View style={styles.heroScene}>
                <View style={StyleSheet.absoluteFill}>
                  <HubScene />
                </View>
                <View style={styles.heroVolt}>
                  <Volt count={25} goal={100} size={132} />
                </View>
              </View>
              <Text style={styles.kicker}>SCROLLTALLY</Text>
              <Text style={styles.title}>Every reel, counted.</Text>
              <Text style={styles.copy}>
                ScrollTally counts each short video you watch, across Instagram, YouTube, Facebook and
                Snapchat, and shows the number while you scroll. No guessing, no vague screen-time
                averages. A number.
              </Text>
              <View style={styles.pillPreview}>
                <Glyph name="bolt" size={18} color={colors.amber} />
                <Text style={styles.pillText}>128 reels today</Text>
              </View>
              <Text style={styles.fine}>
                In this demo build the count comes from the built-in Reels feed. Live counting in
                other apps arrives with the native build.
              </Text>
            </View>
          )}
          {step === 1 && (
            <View>
              <Text style={styles.title}>Where do you scroll?</Text>
              <Text style={styles.copy}>Pick your platforms. You can change this later in Settings.</Text>
              <View style={{ gap: 10, marginTop: 8 }}>
                {PLATFORMS.map((p) => {
                  const on = platforms[p.id];
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => toggle(p.id)}
                      style={[styles.platformRow, on && styles.platformRowOn]}
                    >
                      <PlatformIcon id={p.id} size={36} />
                      <Text style={styles.pLabel}>{p.label}</Text>
                      {on ? <Glyph name="check" size={20} color={colors.amber} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          {step === 2 && (
            <View>
              <Text style={styles.title}>Set a daily goal.</Text>
              <Text style={styles.copy}>
                A reel budget for the day. Cross it and Volt runs empty. Most people start at 100.
              </Text>
              <Text style={styles.goalNumber}>{goal}</Text>
              <Text style={styles.goalUnit}>reels per day</Text>
              <View style={styles.presetRow}>
                {GOAL_PRESETS.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGoal(g)}
                    style={[styles.preset, goal === g && styles.presetOn]}
                  >
                    <Text style={[styles.presetText, goal === g && styles.presetTextOn]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.stepperRow}>
                <Pressable style={styles.stepper} onPress={() => setGoal(Math.max(10, goal - 10))}>
                  <Text style={styles.stepperText}>−10</Text>
                </Pressable>
                <Pressable style={styles.stepper} onPress={() => setGoal(Math.min(500, goal + 10))}>
                  <Text style={styles.stepperText}>+10</Text>
                </Pressable>
              </View>
            </View>
          )}
          {step === 3 && (
            <View>
              <View style={[styles.heroScene, { height: 190 }]}>
                <View style={StyleSheet.absoluteFill}>
                  <HubScene />
                </View>
                <View style={styles.heroVolt}>
                  <Volt count={Math.round(goal * 0.25)} goal={goal} size={138} />
                </View>
              </View>
              <Text style={[styles.title, { textAlign: 'center' }]}>Meet Volt.</Text>
              <View style={styles.chatRow}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>V</Text>
                </View>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>
                    Hi, I am Volt. Every reel you watch drains a little of my charge.
                  </Text>
                </View>
              </View>
              <Text style={[styles.copy, { textAlign: 'center' }]}>
                Volt is your charge. Every reel drains a little. Keep the count under your goal and
                Volt stays bright. Cross it, and Volt goes empty.
              </Text>
            </View>
          )}
        </ReAnimated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.cta, step === 1 && !anyPlatform && styles.ctaDisabled]}
          disabled={step === 1 && !anyPlatform}
          onPress={next}
        >
          <Text style={styles.ctaText}>{step === 3 ? 'Start counting' : 'Continue'}</Text>
        </Pressable>
        {step === 1 && !anyPlatform ? (
          <Text style={styles.fine}>Pick at least one platform.</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  dots: { flexDirection: 'row', gap: 7, paddingHorizontal: 24, paddingTop: 14 },
  dot: { width: 26, height: 5, borderRadius: 3, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.amber },
  dotDone: { backgroundColor: colors.star },
  body: { padding: 24, paddingTop: 24, flexGrow: 1 },
  heroScene: {
    height: 168,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: colors.line,
    borderWidth: 1,
    ...cardShadow,
  },
  heroVolt: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber, marginBottom: 10 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.cream, lineHeight: 40, marginBottom: 12 },
  copy: { fontFamily: fonts.body, fontSize: 16, color: colors.creamDim, lineHeight: 24 },
  fine: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, lineHeight: 18, marginTop: 14, textAlign: 'center' },
  pillPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  pillText: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
  },
  platformRowOn: { borderColor: colors.amber, backgroundColor: colors.panelAlt },
  pLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.cream, flex: 1 },
  goalNumber: { fontFamily: fonts.display, fontSize: 84, color: colors.cream, textAlign: 'center', marginTop: 18 },
  goalUnit: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.muted, textAlign: 'center' },
  presetRow: { flexDirection: 'row', justifyContent: 'center', gap: 9, marginTop: 24, flexWrap: 'wrap' },
  preset: { borderRadius: 999, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.panel, paddingVertical: 9, paddingHorizontal: 17 },
  presetOn: { backgroundColor: colors.amber, borderColor: colors.amber },
  presetText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.creamDim },
  presetTextOn: { color: colors.black },
  stepperRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 },
  stepper: { borderRadius: 999, backgroundColor: colors.panelAlt, paddingVertical: 10, paddingHorizontal: 20 },
  stepperText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.cream },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 14, marginTop: 2 },
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
  footer: { padding: 24, paddingTop: 6 },
  cta: { backgroundColor: colors.amber, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontFamily: fonts.bodyBlack, fontSize: 16.5, color: colors.black },
});
