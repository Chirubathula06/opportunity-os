import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { rankOpportunities } from '../utils/matching';

export function AIMatchScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMatches() {
    setLoading(true);

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('verification_status', 'verified')
      .gte('trust_score', 80)
      .in('status', ['active', 'upcoming'])
      .order('trust_score', { ascending: false });

    if (error) {
      console.warn(error.message);
      setOpportunities([]);
    } else {
      setOpportunities((data ?? []) as Opportunity[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const matches = useMemo(() => {
    if (!profile) return [];
    return rankOpportunities(profile, opportunities);
  }, [profile, opportunities]);

  const topMatch = matches[0];

  const averageScore =
    matches.length > 0
      ? Math.round(
          matches.reduce((sum, item) => sum + item.match.score, 0) /
            matches.length
        )
      : 0;

  const strongMatches = matches.filter(item => item.match.score >= 70).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#050816', '#111827']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.loadingOrb}>
          <ActivityIndicator color="#020617" />
        </View>

        <Text style={styles.loadingTitle}>AI is ranking opportunities</Text>
        <Text style={styles.loadingText}>
          Comparing your profile with verified sources, eligibility, skills,
          interests, trust, and quality signals.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#020617', '#050816', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Personal AI Ranking</Text>
            <Text style={styles.title}>AI Match Me</Text>
          </View>

          <View style={styles.headerOrb}>
            <BrainCircuit size={25} color="#020617" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Opportunity OS ranks verified opportunities using your role,
          education, location, skills, interests, eligibility, trust score, and
          opportunity quality.
        </Text>

        <LinearGradient
          colors={[
            'rgba(103,232,249,0.18)',
            'rgba(167,139,250,0.12)',
            'rgba(255,255,255,0.04)'
          ]}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Sparkles size={24} color="#020617" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>AI Match Engine</Text>
              <Text style={styles.heroTitle}>
                {topMatch
                  ? `${topMatch.match.score}% top match found`
                  : 'No matches yet'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroText}>
            No fake listings. No hallucinated opportunities. Only verified
            records from trusted sources are ranked.
          </Text>

          <View style={styles.heroStats}>
            <AIStat
              icon={<Target size={16} color="#67e8f9" />}
              value={averageScore.toString()}
              label="Avg Match"
            />

            <View style={styles.heroDivider} />

            <AIStat
              icon={<ShieldCheck size={16} color="#22c55e" />}
              value={strongMatches.toString()}
              label="Strong Matches"
            />

            <View style={styles.heroDivider} />

            <AIStat
              icon={<TrendingUp size={16} color="#a78bfa" />}
              value={matches.length.toString()}
              label="Ranked"
            />
          </View>
        </LinearGradient>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches available</Text>
            <Text style={styles.emptyText}>
              Complete your profile or add more verified opportunities to the
              database.
            </Text>
          </View>
        ) : (
          matches.map(({ opportunity, match }, index) => (
            <Animated.View
              key={opportunity.id}
              entering={FadeInDown.delay(Math.min(index * 35, 450)).springify()}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.matchCard,
                  pressed && styles.cardPressed
                ]}
                onPress={() =>
                  navigation.navigate('OpportunityDetail', {
                    opportunityId: opportunity.id
                  })
                }
              >
                <View style={styles.topRow}>
                  <View style={styles.rankBox}>
                    <Text style={styles.rank}>#{index + 1}</Text>
                  </View>

                  <View style={styles.scoreBadge}>
                    <Sparkles size={14} color="#020617" />
                    <Text style={styles.scoreText}>{match.score}% Match</Text>
                  </View>
                </View>

                <Text style={styles.category}>{opportunity.category}</Text>

                <Text style={styles.cardTitle}>{opportunity.title}</Text>

                <Text style={styles.provider}>
                  {opportunity.provider} · {opportunity.country ?? 'Global'}
                </Text>

                <View style={styles.metaRow}>
                  <Badge text={`Trust ${opportunity.trust_score}`} />

                  {(opportunity.quality_score ?? 0) > 0 && (
                    <Badge text={`Quality ${opportunity.quality_score}`} />
                  )}

                  {opportunity.link_health === 'healthy' && (
                    <Badge text="Live Link" green />
                  )}

                  <Badge text={opportunity.status} purple />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Why AI likes this</Text>

                  {(match.reasons.length
                    ? match.reasons
                    : ['Your profile has partial eligibility overlap.']
                  )
                    .slice(0, 3)
                    .map(reason => (
                      <View key={reason} style={styles.reasonRow}>
                        <CheckCircle2 size={15} color="#22c55e" />
                        <Text style={styles.goodLine}>{reason}</Text>
                      </View>
                    ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Missing requirements</Text>

                  {(match.missingRequirements.length
                    ? match.missingRequirements
                    : ['No major missing requirements detected.']
                  )
                    .slice(0, 2)
                    .map(reason => (
                      <View key={reason} style={styles.reasonRow}>
                        <AlertTriangle size={15} color="#f59e0b" />
                        <Text style={styles.warnLine}>{reason}</Text>
                      </View>
                    ))}
                </View>

                <View style={styles.actionBox}>
                  <Text style={styles.actionTitle}>Recommended action</Text>
                  <Text style={styles.actionText}>
                    {match.recommendedAction}
                  </Text>
                </View>

                <View style={styles.viewButton}>
                  <Text style={styles.viewText}>View Opportunity</Text>
                  <ArrowRight size={16} color="#67e8f9" />
                </View>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Badge({
  text,
  green,
  purple
}: {
  text: string;
  green?: boolean;
  purple?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        green && styles.badgeGreen,
        purple && styles.badgePurple
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          green && styles.badgeTextGreen,
          purple && styles.badgeTextPurple
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function AIStat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.aiStat}>
      {icon}
      <Text style={styles.aiStatValue}>{value}</Text>
      <Text style={styles.aiStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617'
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 120
  },
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(103,232,249,0.17)'
  },
  glowTwo: {
    position: 'absolute',
    bottom: 140,
    left: -130,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167,139,250,0.14)'
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 21
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
    marginBottom: 10
  },
  eyebrow: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.4
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  headerOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67e8f9',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroEyebrow: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 4,
    fontSize: 12
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  heroText: {
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 18
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.36)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 14
  },
  heroDivider: {
    width: 1,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  aiStat: {
    flex: 1,
    alignItems: 'center'
  },
  aiStatValue: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 21,
    marginTop: 5
  },
  aiStatLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  empty: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 22
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 6
  },
  emptyText: {
    color: '#94a3b8',
    lineHeight: 21
  },
  matchCard: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: 'rgba(103,232,249,0.4)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  rankBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(167,139,250,0.16)',
    borderColor: 'rgba(167,139,250,0.24)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rank: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '900'
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#67e8f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999
  },
  scoreText: {
    color: '#020617',
    fontWeight: '900'
  },
  category: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 8
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    marginBottom: 6
  },
  provider: {
    color: '#cbd5e1',
    marginBottom: 13
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeGreen: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.28)'
  },
  badgePurple: {
    backgroundColor: 'rgba(167,139,250,0.14)',
    borderColor: 'rgba(167,139,250,0.28)'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900'
  },
  badgeTextGreen: {
    color: '#22c55e'
  },
  badgeTextPurple: {
    color: '#c4b5fd'
  },
  section: {
    marginTop: 12
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 9
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 7
  },
  goodLine: {
    color: '#bbf7d0',
    lineHeight: 21,
    flex: 1
  },
  warnLine: {
    color: '#fde68a',
    lineHeight: 21,
    flex: 1
  },
  actionBox: {
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginTop: 16
  },
  actionTitle: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 5
  },
  actionText: {
    color: '#e0f2fe',
    lineHeight: 21
  },
  viewButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.09)',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16
  },
  viewText: {
    color: '#67e8f9',
    fontWeight: '900'
  }
});