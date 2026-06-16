import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, shadow } from '../utils/theme';

export function Label({ children }: { children: React.ReactNode }) { return <Text style={styles.label}>{children}</Text>; }
export function H1({ children }: { children: React.ReactNode }) { return <Text style={styles.h1}>{children}</Text>; }
export function Sub({ children }: { children: React.ReactNode }) { return <Text style={styles.sub}>{children}</Text>; }
export function Card({ children, glow=false }: { children: React.ReactNode; glow?: boolean }) { return <View style={[styles.card, glow && shadow]}>{children}</View>; }
export function Pill({ text, active=false, onPress }: { text: string; active?: boolean; onPress?: () => void }) { return <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{text}</Text></Pressable>; }
export function Button({ text, onPress, secondary=false }: { text: string; onPress: () => void; secondary?: boolean }) { return <Pressable onPress={onPress} style={[styles.button, secondary && styles.button2]}><Text style={styles.buttonText}>{text}</Text></Pressable>; }
export function Input(props: React.ComponentProps<typeof TextInput>) { return <TextInput placeholderTextColor={colors.faint} {...props} style={[styles.input, props.style]} />; }
export function Row({ children }: { children: React.ReactNode }) { return <View style={styles.row}>{children}</View>; }

const styles = StyleSheet.create({
  label: { color: colors.cyan, fontWeight: '900', fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 },
  h1: { color: colors.text, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.4 },
  sub: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.stroke, borderRadius: 26, padding: 18, marginVertical: 10, overflow: 'hidden' },
  pill: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: colors.stroke, marginRight: 8, marginBottom: 8 },
  pillActive: { backgroundColor: colors.text, borderColor: colors.text },
  pillText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  pillTextActive: { color: colors.bg, fontWeight: '900' },
  button: { backgroundColor: colors.cyan, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', marginTop: 14 },
  button2: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: colors.stroke },
  buttonText: { color: colors.bg, fontWeight: '900', fontSize: 15 },
  input: { backgroundColor: 'rgba(5,6,19,0.74)', color: colors.text, borderRadius: 17, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: colors.stroke, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }
});
