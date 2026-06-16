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
import { useNavigation } from '@react-navigation/native';
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BrainCircuit,
  Compass,
  Flame,
  FolderKanban,
  Grid3X3,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { rankOpportunities } from '../utils/matching';
import { OpportunityCard } from '../components/OpportunityCard';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    if (!profile?.id) return;

    setLoading(true);

    const [{ data: oppData, error: oppError }, { count, error: savedError }] =
      await Promise.all([
        supabase
          .from('opportunities')
          .select('*')
          .eq('verification_status', 'verified')
          .gte('trust_score', 80)
          .in('status', ['active', 'upcoming'])
          .order('trust_score', { ascending: false }),

        supabase
          .from('saved_opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
      ]);

    if (oppError) console.warn(oppError.message);
    if (savedError) console.warn(savedError.message);

    setOpportunities((oppData ?? []) as Opportunity[]);
    setSavedCount(count ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [profile?.id]);

  const ranked = useMemo(() => {
    if (!profile) return [];
    return rankOpportunities(profile, opportunities);
  }, [profile, opportunities]);

  const topMatch = ranked[0];
  const topFive = ranked.slice(0, 5);

  const averageScore =
    ranked.length > 0
      ? Math.round(
          ranked.slice(0, 8).reduce((sum, item) => sum + item.match.score, 0) /
            Math.min(8, ranked.length)
        )
      : 0;

  const strongMatches = ranked.filter(item => item.match.score >= 70).length;

  const categoryCount = new Set(opportunities.map(item => item.category)).size;

  const averageTrust =
    opportunities.length > 0
      ? Math.round(
          opportunities.reduce((sum, item) => sum + item.trust_score, 0) /
            opportunities.length
        )
      : 0;

  const topCategories = useMemo(() => {
    const counts = opportunities.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [opportunities]);

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#050816', '#111827']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.loadingOrb}>
          <ActivityIndicator size="large" color="#020617" />
        </View>

        <Text style={styles.loadingTitle}>Building your AI dashboard</Text>
        <Text style={styles.loadingText}>
          Ranking verified opportunities by your profile, skills, eligibility,
          and trust.
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Opportunity OS</Text>
            <Text style={styles.greeting}>
              Hello, {profile?.full_name ?? 'Explorer'} 👋
            </Text>
          </View>

          <View style={styles.avatarOrb}>
            <Text style={styles.avatarText}>
              {(profile?.full_name ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Your AI-powered command center for verified opportunities, official
          apply links, and personalized matching.
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
            <View style={styles.scoreRing}>
              <Text style={styles.scoreNumber}>{averageScore}</Text>
              <Text style={styles.scoreLabel}>AI Score</Text>
            </View>

            <View style={styles.scoreCopy}>
              <View style={styles.liveBadge}>
                <BrainCircuit size={14} color="#67e8f9" />
                <Text style={styles.liveBadgeText}>Personalized ranking</Text>
              </View>

              <Text style={styles.scoreTitle}>Opportunity Readiness</Text>

              <Text style={styles.scoreDescription}>
                Based on your role, education, location, skills, interests, and
                verified opportunity trust signals.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<ShieldCheck size={19} color="#67e8f9" />}
            label="Verified"
            value={opportunities.length.toString()}
          />

          <StatCard
            icon={<Target size={19} color="#a78bfa" />}
            label="Top Matches"
            value={strongMatches.toString()}
          />

          <StatCard
            icon={<Bookmark size={19} color="#22c55e" />}
            label="Saved"
            value={savedCount.toString()}
          />

          <StatCard
            icon={<Grid3X3 size={19} color="#facc15" />}
            label="Categories"
            value={categoryCount.toString()}
          />
        </View>

        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <BadgeCheck size={18} color="#67e8f9" />
            <Text style={styles.trustValue}>{averageTrust}</Text>
            <Text style={styles.trustLabel}>Avg Trust</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Verified database active</Text>
            <Text style={styles.trustText}>
              Only active opportunities with trusted official source links are
              shown to users.
            </Text>
          </View>
        </View>

        {topMatch ? (
          <View style={styles.recommendation}>
            <View style={styles.sectionTop}>
              <View>
                <Text style={styles.sectionEyebrow}>Top AI Recommendation</Text>
                <Text style={styles.recommendationTitle}>
                  {topMatch.opportunity.title}
                </Text>
              </View>

              <View style={styles.hotOrb}>
                <Flame size={22} color="#020617" />
              </View>
            </View>

            <Text style={styles.recommendationProvider}>
              {topMatch.opportunity.provider} · {topMatch.opportunity.category}
            </Text>

            <View style={styles.recommendationMeta}>
              <Text style={styles.matchPill}>{topMatch.match.score}% match</Text>
              <Text style={styles.trustPill}>
                Trust {topMatch.opportunity.trust_score}
              </Text>
              {topMatch.opportunity.link_health === 'healthy' && (
                <Text style={styles.livePill}>Live Link</Text>
              )}
            </View>

            <Text style={styles.reason}>
              {topMatch.match.reasons[0] ??
                'This is a strong verified opportunity for your profile.'}
            </Text>

            <View style={styles.aiReasons}>
              <MiniReason text="Profile eligible" />
              <MiniReason text="Skills aligned" />
              <MiniReason text="Trusted source" />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed
              ]}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: topMatch.opportunity.id
                })
              }
            >
              <Text style={styles.primaryButtonText}>View Opportunity</Text>
              <ArrowRight size={18} color="#020617" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyText}>
              Complete your profile or add more verified opportunities.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionCaption}>Move faster</Text>
        </View>

        <View style={styles.actionsGrid}>
          <ActionButton
            icon={<Search size={20} color="#67e8f9" />}
            label="Find Opportunities"
            text="Browse all verified records"
            onPress={() => navigation.navigate('Explore')}
          />

          <ActionButton
            icon={<Sparkles size={20} color="#a78bfa" />}
            label="AI Match Me"
            text="Rank by your profile"
            onPress={() => navigation.navigate('AIMatch')}
          />

          <ActionButton
            icon={<FolderKanban size={20} color="#22c55e" />}
            label="Saved Tracker"
            text="Manage applications"
            onPress={() => navigation.navigate('Saved')}
          />

          <ActionButton
            icon={<UserRound size={20} color="#facc15" />}
            label="Profile"
            text="Improve match quality"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {topCategories.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Categories</Text>
              <Text style={styles.sectionCaption}>Database depth</Text>
            </View>

            <View style={styles.categoryPanel}>
              {topCategories.map(([category, count]) => (
                <View key={category} style={styles.categoryRow}>
                  <View style={styles.categoryIcon}>
                    <Compass size={16} color="#67e8f9" />
                  </View>

                  <Text style={styles.categoryName}>{category}</Text>

                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 5 Matches</Text>
          <Text style={styles.sectionCaption}>Best for you</Text>
        </View>

        {topFive.map(item => (
          <OpportunityCard
            key={item.opportunity.id}
            opportunity={item.opportunity}
            matchScore={item.match.score}
            reason={item.match.reasons[0]}
            onPress={() =>
              navigation.navigate('OpportunityDetail', {
                opportunityId: item.opportunity.id
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  text,
  onPress
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.buttonPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionText}>{label}</Text>
      <Text style={styles.actionSubtext}>{text}</Text>
    </Pressable>
  );
}

function MiniReason({ text }: { text: string }) {
  return (
    <View style={styles.miniReason}>
      <Trophy size={13} color="#67e8f9" />
      <Text style={styles.miniReasonText}>{text}</Text>
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
    bottom: 120,
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
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
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
  headerRow: {
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
  greeting: {
    color: '#ffffff',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  avatarOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67e8f9',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8
  },
  avatarText: {
    color: '#020617',
    fontSize: 22,
    fontWeight: '900'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20
  },
  scoreRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    borderColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.55)'
  },
  scoreNumber: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900'
  },
  scoreLabel: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900'
  },
  scoreCopy: {
    flex: 1
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10
  },
  liveBadgeText: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 11
  },
  scoreTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6
  },
  scoreDescription: {
    color: '#cbd5e1',
    lineHeight: 20,
    fontSize: 13
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 17
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  statValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900'
  },
  statLabel: {
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '800'
  },
  trustStrip: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.2)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    marginBottom: 20
  },
  trustItem: {
    width: 82,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trustValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4
  },
  trustLabel: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '900'
  },
  trustDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  trustCopy: {
    flex: 1
  },
  trustTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 5
  },
  trustText: {
    color: '#94a3b8',
    lineHeight: 19,
    fontSize: 13
  },
  recommendation: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderColor: 'rgba(167,139,250,0.22)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    marginBottom: 24
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 8
  },
  sectionEyebrow: {
    color: '#a78bfa',
    fontWeight: '900',
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.3
  },
  hotOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recommendationTitle: {
    color: '#ffffff',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900'
  },
  recommendationProvider: {
    color: '#cbd5e1',
    marginBottom: 14
  },
  recommendationMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 14
  },
  matchPill: {
    color: '#020617',
    backgroundColor: '#67e8f9',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '900'
  },
  trustPill: {
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '900'
  },
  livePill: {
    color: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.12)',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '900'
  },
  reason: {
    color: '#e0f2fe',
    lineHeight: 21,
    marginBottom: 14
  },
  aiReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  miniReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1
  },
  miniReasonText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '900'
  },
  primaryButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  primaryButtonText: {
    color: '#020617',
    fontWeight: '900'
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 6
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 4
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900'
  },
  sectionCaption: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 12
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 4
  },
  actionSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17
  },
  categoryPanel: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 14,
    marginBottom: 24
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(103,232,249,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryName: {
    flex: 1,
    color: '#ffffff',
    fontWeight: '800'
  },
  categoryCount: {
    color: '#67e8f9',
    fontWeight: '900'
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  }
});