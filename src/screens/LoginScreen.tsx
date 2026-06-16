import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
    }
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#020617', '#050816', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <ArrowLeft size={18} color="#cbd5e1" />
            <Text style={styles.backButtonText}>Welcome</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoOrb}>
              <Sparkles size={28} color="#020617" />
            </View>

            <View style={styles.secureBadge}>
              <ShieldCheck size={15} color="#67e8f9" />
              <Text style={styles.secureText}>Secure login</Text>
            </View>
          </View>

          <Text style={styles.logo}>Opportunity OS</Text>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Continue your verified opportunity discovery journey. Your saved
            applications, AI matches, and tracker are waiting.
          </Text>

          <View style={styles.card}>
            <InputBox
              icon={<Mail size={19} color="#67e8f9" />}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordWrap}>
              <InputBox
                icon={<Lock size={19} color="#67e8f9" />}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                noMargin
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? (
                  <EyeOff size={19} color="#94a3b8" />
                ) : (
                  <Eye size={19} color="#94a3b8" />
                )}
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.disabledButton
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Login</Text>
                  <ArrowRight size={19} color="#020617" />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>After login</Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusDot}>01</Text>
              <Text style={styles.statusText}>
                Incomplete profile → Profile Builder
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusDot}>02</Text>
              <Text style={styles.statusText}>
                Completed profile → AI Dashboard
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusDot}>03</Text>
              <Text style={styles.statusText}>
                Continue saved applications anytime
              </Text>
            </View>
          </View>

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              New here? <Text style={styles.linkStrong}>Create account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputBox({
  icon,
  placeholder,
  value,
  onChangeText,
  noMargin,
  ...props
}: any) {
  return (
    <View style={[styles.inputWrap, noMargin && styles.noMargin]}>
      <View style={styles.inputIcon}>{icon}</View>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617'
  },
  keyboard: {
    flex: 1
  },
  content: {
    padding: 22,
    paddingTop: 54,
    paddingBottom: 44
  },
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(103,232,249,0.18)'
  },
  glowTwo: {
    position: 'absolute',
    bottom: -100,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167,139,250,0.16)'
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 30
  },
  backButtonText: {
    color: '#cbd5e1',
    fontWeight: '800',
    fontSize: 13
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22
  },
  logoOrb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67e8f9',
    shadowOpacity: 0.45,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderColor: 'rgba(103,232,249,0.28)',
    borderWidth: 1,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  secureText: {
    color: '#cbd5e1',
    fontWeight: '800',
    fontSize: 12
  },
  logo: {
    color: '#67e8f9',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0.4
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginBottom: 12
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 14
  },
  noMargin: {
    marginBottom: 0
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 15
  },
  passwordWrap: {
    position: 'relative',
    marginBottom: 16
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 15
  },
  primaryButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  disabledButton: {
    opacity: 0.7
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }]
  },
  primaryButtonText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 16
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 22
  },
  statusTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 17,
    marginBottom: 12
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  statusDot: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12,
    width: 24
  },
  statusText: {
    color: '#cbd5e1',
    fontWeight: '800',
    flex: 1
  },
  link: {
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '800'
  },
  linkStrong: {
    color: '#a78bfa'
  }
});