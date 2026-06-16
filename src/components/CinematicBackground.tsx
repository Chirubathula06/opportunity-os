import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function CinematicBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#020617', '#050816', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.gridOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(103,232,249,0.18)'
  },
  glowTwo: {
    position: 'absolute',
    bottom: 120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(167,139,250,0.16)'
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.72)'
  }
});