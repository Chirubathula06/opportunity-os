import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';

export function Shell({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: true })
    ])).start();
  }, []);
  const orbScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const Content = scroll ? ScrollView : View;
  return (
    <LinearGradient colors={['#050613', '#0A0E28', '#110C2E']} style={styles.root}>
      <Animated.View style={[styles.orbOne, { transform: [{ scale: orbScale }] }]} />
      <Animated.View style={[styles.orbTwo, { opacity: pulse.interpolate({ inputRange: [0,1], outputRange: [0.24, 0.42] }) }]} />
      <Content style={styles.scroller as any} contentContainerStyle={[styles.content, { maxWidth: width > 720 ? 520 : undefined }]}>
        {children}
      </Content>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroller: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 58, paddingBottom: 36 },
  orbOne: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(139,92,255,0.34)', left: -110, top: 80 },
  orbTwo: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(56,255,225,0.26)', right: -110, bottom: 60 }
});
