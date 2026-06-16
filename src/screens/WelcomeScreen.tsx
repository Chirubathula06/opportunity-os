import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react-native';

export function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#020617', '#050816', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.glowThree} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topRow}>
          <View style={styles.logoOrb}>
            <Text style={styles.logoText}>OS</Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live verified feed</Text>
          </View>
        </View>

        <View style={styles.eyebrowPill}>
          <Sparkles size={15} color="#67e8f9" />
          <Text style={styles.eyebrow}>AI Verified Opportunity Discovery</Text>
        </View>

        <Text style={styles.title}>
          Find opportunities you can actually apply for.
        </Text>

        <Text style={styles.subtitle}>
          Discover verified scholarships, internships, hackathons, fellowships,
          grants, startup programs, research roles, open-source programs, and
          government benefits — ranked by your profile, eligibility, and trust.
        </Text>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={[
              'rgba(103,232,249,0.18)',
              'rgba(167,139,250,0.12)',
              'rgba(255,255,255,0.04)'
            ]}
            style={styles.heroGradient}
          >
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.cardEyebrow}>Opportunity OS</Text>
                <Text style={styles.cardTitle}>
                  Your AI opportunity command center
                </Text>
              </View>

              <View style={styles.aiOrb}>
                <BrainCircuit size={24} color="#020617" />
              </View>
            </View>

            <View style={styles.metricRow}>
              <Metric value="100+" label="verified opportunities" />
              <Metric value="AI" label="profile match ranking" />
              <Metric value="Live" label="official apply links" />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.trustPanel}>
          <Text style={styles.trustTitle}>Built for real outcomes</Text>

          <Feature
            icon={<ShieldCheck size={18} color="#67e8f9" />}
            title="Verified sources only"
            text="Opportunities are linked to trusted official pages."
          />

          <Feature
            icon={<BrainCircuit size={18} color="#a78bfa" />}
            title="Personalized AI ranking"
            text="Matches are ranked using your role, skills, interests, and eligibility."
          />

          <Feature
            icon={<ExternalLink size={18} color="#22c55e" />}
            title="Direct apply links"
            text="Skip fake posts and go straight to the official application source."
          />

          <Feature
            icon={<BadgeCheck size={18} color="#facc15" />}
            title="Track your progress"
            text="Save, plan, apply, and manage opportunities in one place."
          />
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Example match</Text>

          <View style={styles.previewTop}>
            <View>
              <Text style={styles.previewTitle}>Google Summer of Code</Text>
              <Text style={styles.previewMeta}>Open Source · Global</Text>
            </View>

            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>94% Match</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <SmallBadge text="Trust 96" />
            <SmallBadge text="Live Link" cyan />
            <SmallBadge text="AI Ranked" purple />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryText}>Create Account</Text>
          <ArrowRight size={19} color="#020617" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryText}>Login</Text>
        </Pressable>

        <Text style={styles.footerText}>
          No fake listings. No random links. Just verified opportunities ranked
          for you.
        </Text>
      </ScrollView>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Feature({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>{icon}</View>

      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

function SmallBadge({
  text,
  cyan,
  purple
}: {
  text: string;
  cyan?: boolean;
  purple?: boolean;
}) {
  return (
    <View
      style={[
        styles.smallBadge,
        cyan && styles.cyanBadge,
        purple && styles.purpleBadge
      ]}
    >
      <Text
        style={[
          styles.smallBadgeText,
          cyan && styles.cyanText,
          purple && styles.purpleText
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617'
  },
  content: {
    padding: 22,
    paddingTop: 58,
    paddingBottom: 44
  },
  glowOne: {
    position: 'absolute',
    top: -130,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(103,232,249,0.18)'
  },
  glowTwo: {
    position: 'absolute',
    top: 230,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(167,139,250,0.16)'
  },
  glowThree: {
    position: 'absolute',
    bottom: -120,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(34,197,94,0.08)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28
  },
  logoOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67e8f9',
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10
  },
  logoText: {
    color: '#020617',
    fontSize: 25,
    fontWeight: '900'
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderColor: 'rgba(103,232,249,0.28)',
    borderWidth: 1,
    backgroundColor: 'rgba(103,232,249,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e'
  },
  liveText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800'
  },
  eyebrowPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16
  },
  eyebrow: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.2
  },
  title: {
    color: '#ffffff',
    fontSize: 44,
    lineHeight: 49,
    fontWeight: '900',
    letterSpacing: -1.4,
    marginBottom: 16
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 24
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroGradient: {
    padding: 22
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 20
  },
  cardEyebrow: {
    color: '#a78bfa',
    fontWeight: '900',
    marginBottom: 7
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.4,
    maxWidth: 250
  },
  aiOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.66)',
    borderColor: 'rgba(103,232,249,0.16)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12
  },
  metricValue: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 17,
    marginBottom: 3
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15
  },
  trustPanel: {
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18
  },
  trustTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureCopy: {
    flex: 1
  },
  featureTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 3
  },
  featureText: {
    color: '#94a3b8',
    lineHeight: 19,
    fontSize: 13
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 22
  },
  previewLabel: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 10
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 4
  },
  previewMeta: {
    color: '#94a3b8',
    fontSize: 13
  },
  matchBadge: {
    backgroundColor: '#67e8f9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start'
  },
  matchText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 12
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  smallBadge: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(167,139,250,0.14)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  cyanBadge: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6,182,212,0.13)'
  },
  purpleBadge: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(192,132,252,0.13)'
  },
  smallBadgeText: {
    color: '#d8b4fe',
    fontSize: 11,
    fontWeight: '900'
  },
  cyanText: {
    color: '#67e8f9'
  },
  purpleText: {
    color: '#c084fc'
  },
  primaryButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  primaryText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 16
  },
  secondaryButton: {
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  secondaryText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  },
  footerText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 20,
    fontSize: 13
  }
});