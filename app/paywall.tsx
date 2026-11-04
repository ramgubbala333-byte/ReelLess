import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';

import Glyph from '@/components/Glyph';
import { colors, fonts, cardShadow } from '@/theme';

const FEATURES = [
  { title: 'Real blocking', body: 'Cross your goal and the feeds close, in the apps themselves. Native build feature.' },
  { title: 'Advanced stats', body: 'Monthly trends, hourly patterns, and your scroll weather report.' },
  { title: 'Home-screen widget', body: 'Your count and Volt, live on the home screen.' },
  { title: 'Friend duels, for real', body: 'Accounts, invites, and a weekly league.' },
];

export default function Paywall() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.kicker}>SCROLLTALLY PRO</Text>
        <Text style={styles.title}>More charge, kept honest.</Text>
        <Text style={styles.copy}>
          PRO is planned for the native build. In v1 the paywall is off and every feature in this
          app is free.
        </Text>

        <View style={{ gap: 12, marginTop: 20 }}>
          {FEATURES.map((f, i) => (
            <ReAnimated.View key={f.title} entering={FadeInUp.delay(i * 80).duration(380)} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Glyph name="check" size={17} color={colors.black} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </ReAnimated.View>
          ))}
        </View>

        <View style={styles.promise}>
          <Text style={styles.promiseTitle}>The grandfathering promise</Text>
          <Text style={styles.promiseBody}>
            Anyone using ScrollTally before PRO launches keeps the full counting, stats and duel
            features free, forever. If pricing ever ships, it will be a single lifetime option
            first, not a weekly trap.
          </Text>
        </View>

        <View style={styles.planRow}>
          <View style={styles.plan}>
            <Text style={styles.planName}>Lifetime</Text>
            <Text style={styles.planPrice}>$29.99</Text>
            <Text style={styles.planNote}>Planned, not on sale</Text>
          </View>
          <View style={styles.plan}>
            <Text style={styles.planName}>Yearly</Text>
            <Text style={styles.planPrice}>$19.99</Text>
            <Text style={styles.planNote}>Planned, not on sale</Text>
          </View>
        </View>

        <Pressable style={styles.close} onPress={() => router.back()}>
          <Text style={styles.closeText}>Back to the free app</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 24, paddingBottom: 36 },
  kicker: { fontFamily: fonts.bodyBlack, fontSize: 13, letterSpacing: 3, color: colors.amber },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.cream, lineHeight: 36, marginTop: 8 },
  copy: { fontFamily: fonts.body, fontSize: 15, color: colors.creamDim, lineHeight: 22, marginTop: 10 },
  feature: { flexDirection: 'row', gap: 11, backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 20, padding: 14, alignItems: 'center', ...cardShadow },
  featureIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.cream },
  featureBody: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 18, marginTop: 3 },
  promise: { backgroundColor: colors.panelAlt, borderColor: colors.amber, borderWidth: 1.5, borderRadius: 22, padding: 16, marginTop: 20 },
  promiseTitle: { fontFamily: fonts.bodyBlack, fontSize: 15, color: colors.amberSoft },
  promiseBody: { fontFamily: fonts.body, fontSize: 13.5, color: colors.creamDim, lineHeight: 20, marginTop: 6 },
  planRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  plan: { flex: 1, backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: 20, padding: 14, alignItems: 'center' },
  planName: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: colors.muted },
  planPrice: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.cream, marginTop: 4 },
  planNote: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 3 },
  close: { backgroundColor: colors.amber, borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  closeText: { fontFamily: fonts.bodyBlack, fontSize: 15.5, color: colors.black },
});
