import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { selectToday, useStore } from '../store/useStore';
import { colors, fonts } from '../theme';
import { formatTimeSpent, todayKey } from '../utils';
import { EASE_OUT } from './motion';
import Volt from './Volt';

/** Statement modal shown the moment today's count crosses the daily goal. */
export default function GoalCrossedModal() {
  const router = useRouter();
  const goal = useStore((s) => s.goal);
  const dismissedFor = useStore((s) => s.goalModalDismissedFor);
  const today = useStore(selectToday);
  const dismiss = useStore((s) => s.dismissGoalModal);

  const visible = today.total > goal && dismissedFor !== todayKey();

  // Entrance: backdrop fades in, the card springs up into place. Volt is
  // rendered in his empty state, so his own run-dry flicker fires on mount.
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      rise.setValue(28);
      return;
    }
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, easing: EASE_OUT, useNativeDriver: false }),
      Animated.spring(rise, { toValue: 0, friction: 7, tension: 62, useNativeDriver: false }),
    ]).start();
  }, [visible, fade, rise]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: rise }] }]}>
          <Volt count={today.total} goal={goal} size={120} />
          <Text style={styles.title}>Goal crossed.</Text>
          <Text style={styles.body}>
            {today.total} reels today. About {formatTimeSpent(today.total)} of scrolling.
          </Text>
          <Text style={styles.sub}>Your daily goal was {goal}. Volt is empty.</Text>
          <Pressable
            style={[styles.btn, styles.breakBtn]}
            onPress={() => {
              dismiss();
              router.push('/break');
            }}
          >
            <Text style={styles.breakText}>Take a break</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.keepBtn]} onPress={dismiss}>
            <Text style={styles.keepText}>Keep going</Text>
          </Pressable>
          <Text style={styles.demo}>Demo limit. Real blocking arrives with the native build.</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,11,20,0.84)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: {
    width: '100%',
    backgroundColor: colors.panel,
    borderColor: colors.rust,
    borderWidth: 1.5,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#04070F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.cream, marginTop: 6 },
  body: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.creamDim, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  sub: { fontFamily: fonts.body, fontSize: 13.5, color: colors.muted, textAlign: 'center', marginTop: 6 },
  btn: { width: '100%', borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 14 },
  breakBtn: { backgroundColor: colors.amber },
  breakText: { fontFamily: fonts.bodyBlack, fontSize: 16, color: colors.black },
  keepBtn: { backgroundColor: colors.panelAlt, borderColor: colors.line, borderWidth: 1, marginTop: 10 },
  keepText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.creamDim },
  demo: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 14, textAlign: 'center' },
});
