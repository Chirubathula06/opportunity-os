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
import { ArrowRight, BrainCircuit, Bookmark, ShieldCheck, Sparkles } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { rankOpportunities } from '../utils/matching';

export default function MatchesScreen({ navigation }: any) {
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
    return rankOpportunities(profile, opportunities).slice(0, 10);
  }, [profile, opportunities]);

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#050816', '#111827']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator color="#67e8f9" size="large" />
        <Text style={styles.loadingText}>Finding your verified matches...</Text>
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AI Ranked</Text>
            <Text style={styles.title}>Your Verified Matches</Text>
          </View>

          <View style={styles.orb}>
            <BrainCircuit size={25} color="#020617" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          These are your strongest verified opportunities based on your profile,
          eligibility, skills, interests, trust score, and official source quality.
        </Text>

        <View style={styles.heroCard}>
          <Sparkles size={22} color="#67e8f9" />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {matches[0] ? `${matches[0].match.score}% top match found` : 'No matches yet'}
            </Text>
            <Text style={styles.heroText}>
              No demo data. These are real verified database records.
            </Text>
          </View>
        </View>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches available</Text>
            <Text style={styles.emptyText}>
              Complete your profile or explore more opportunities.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.primaryText}>Explore Opportunities</Text>
              <ArrowRight size={18} color="#020617" />
            </Pressable>
          </View>
        ) : (
          matches.map(({ opportunity, match }, index) => (
            <Pressable
              key={opportunity.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: opportunity.id
                })
              }
            >
              <View style={styles.cardTop}>
                <Text style={styles.rank}>#{index + 1}</Text>

                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{match.score}% Match</Text>
                </View>
              </View>

              <Text style={styles.category}>{opportunity.category}</Text>
              <Text style={styles.cardTitle}>{opportunity.title}</Text>
              <Text style={styles.provider}>
                {opportunity.provider} · {opportunity.country ?? 'Global'}
              </Text>

              <View style={styles.badgeRow}>
                <Badge text={`Trust ${opportunity.trust_score}`} />
                {(opportunity.quality_score ?? 0) > 0 && (
                  <Badge text={`Quality ${opportunity.quality_score}`} />
                )}
                {opportunity.link_health === 'healthy' && (
                  <Badge text="Live Link" green />
                )}
              </View>

              <Text style={styles.reason}>
                {match.reasons[0] ?? 'Strong verified match for your profile.'}
              </Text>

              <View style={styles.viewRow}>
                <Text style={styles.viewText}>View details</Text>
                <ArrowRight size={16} color="#67e8f9" />
              </View>
            </Pressable>
          ))
        )}

        <Pressable
          style={styles.savedButton}
          onPress={() => navigation.navigate('Saved')}
        >
          <Bookmark size={18} color="#020617" />
          <Text style={styles.savedText}>View Saved Tracker</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Badge({
  text,
  green
}: {
  text: string;
  green?: boolean;
}) {
  return (
    <View style={[styles.badge, green && styles.badgeGreen]}>
      {green && <ShieldCheck size={12} color="#22c55e" />}
      <Text style={[styles.badgeText, green && styles.badgeTextGreen]}>
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
    padding: 20,
    paddingTop: 56,
    paddingBottom: 120
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 14,
    textAlign: 'center'
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
    bottom: 130,
    left: -130,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167,139,250,0.14)'
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
    marginBottom: 6
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  heroCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.2)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 18
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 5
  },
  heroText: {
    color: '#94a3b8',
    lineHeight: 20
  },
  empty: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    marginBottom: 18
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8
  },
  emptyText: {
    color: '#94a3b8',
    lineHeight: 21,
    marginBottom: 16
  },
  primaryButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  primaryText: {
    color: '#020617',
    fontWeight: '900'
  },
  card: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  rank: {
    color: '#a78bfa',
    fontWeight: '900',
    fontSize: 16
  },
  matchBadge: {
    backgroundColor: '#67e8f9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  matchText: {
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
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    marginBottom: 6
  },
  provider: {
    color: '#cbd5e1',
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  badgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 11
  },
  badgeTextGreen: {
    color: '#22c55e'
  },
  reason: {
    color: '#e0f2fe',
    lineHeight: 21,
    marginBottom: 14
  },
  viewRow: {
    borderTopColor: 'rgba(255,255,255,0.09)',
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  viewText: {
    color: '#67e8f9',
    fontWeight: '900'
  },
  savedButton: {
    marginTop: 4,
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  savedText: {
    color: '#020617',
    fontWeight: '900'
  }
});