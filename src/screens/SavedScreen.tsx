import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  ArrowRight,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ShieldCheck,
  Trash2,
  Trophy,
  XCircle
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity, SavedOpportunity, SavedStatus } from '../types';

const statuses: SavedStatus[] = [
  'saved',
  'planning',
  'applied',
  'selected',
  'rejected',
  'expired'
];

type SavedWithOpportunity = SavedOpportunity & {
  opportunities?: Opportunity;
};

export function SavedScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [items, setItems] = useState<SavedWithOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSaved() {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('*, opportunities(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(error.message);
      setItems([]);
    } else {
      setItems((data ?? []) as SavedWithOpportunity[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSaved();
  }, [user?.id]);

  async function updateStatus(id: string, status: SavedStatus) {
    const { error } = await supabase
      .from('saved_opportunities')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }

    await loadSaved();
  }

  async function removeSaved(id: string) {
    Alert.alert(
      'Remove opportunity?',
      'This will remove it from your saved tracker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('saved_opportunities')
              .delete()
              .eq('id', id);

            if (error) {
              Alert.alert('Remove failed', error.message);
              return;
            }

            await loadSaved();
          }
        }
      ]
    );
  }

  const grouped = useMemo(() => {
    return statuses.map(status => ({
      status,
      items: items.filter(item => item.status === status)
    }));
  }, [items]);

  const appliedCount = items.filter(item => item.status === 'applied').length;
  const selectedCount = items.filter(item => item.status === 'selected').length;
  const planningCount = items.filter(item => item.status === 'planning').length;

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

        <Text style={styles.loadingTitle}>Loading your tracker</Text>
        <Text style={styles.loadingText}>
          Preparing your saved opportunities and application progress.
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
            <Text style={styles.eyebrow}>Application Command Center</Text>
            <Text style={styles.title}>Saved Tracker</Text>
          </View>

          <View style={styles.headerOrb}>
            <FolderKanban size={25} color="#020617" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Move opportunities from saved to planning, applied, selected, or
          rejected. Stay organized and never lose a strong opportunity again.
        </Text>

        <View style={styles.statsGrid}>
          <TrackerStat
            icon={<Bookmark size={18} color="#67e8f9" />}
            value={items.length.toString()}
            label="Saved"
          />

          <TrackerStat
            icon={<Clock3 size={18} color="#a78bfa" />}
            value={planningCount.toString()}
            label="Planning"
          />

          <TrackerStat
            icon={<CheckCircle2 size={18} color="#22c55e" />}
            value={appliedCount.toString()}
            label="Applied"
          />

          <TrackerStat
            icon={<Trophy size={18} color="#facc15" />}
            value={selectedCount.toString()}
            label="Selected"
          />
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Bookmark size={26} color="#020617" />
            </View>

            <Text style={styles.emptyTitle}>No saved opportunities yet</Text>

            <Text style={styles.emptyText}>
              Save opportunities from Explore or Opportunity Details. Your
              tracker will help you plan, apply, and monitor progress.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed
              ]}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.primaryText}>Explore Opportunities</Text>
              <ArrowRight size={18} color="#020617" />
            </Pressable>
          </View>
        ) : (
          grouped.map(group =>
            group.items.length > 0 ? (
              <View key={group.status} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLeft}>
                    {statusIcon(group.status)}
                    <Text style={styles.sectionTitle}>
                      {statusLabel(group.status)}
                    </Text>
                  </View>

                  <Text style={styles.sectionCount}>{group.items.length}</Text>
                </View>

                {group.items.map((item, index) => {
                  const opportunity = item.opportunities;

                  if (!opportunity) return null;

                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(
                        Math.min(index * 35, 350)
                      ).springify()}
                    >
                      <View style={styles.card}>
                        <View style={styles.cardTop}>
                          <View style={styles.categoryPill}>
                            <Text style={styles.category}>
                              {opportunity.category}
                            </Text>
                          </View>

                          <View style={styles.currentStatusPill}>
                            <Text style={styles.currentStatusText}>
                              {statusLabel(item.status)}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>
                          {opportunity.title}
                        </Text>

                        <Text style={styles.provider}>
                          {opportunity.provider}
                        </Text>

                        <View style={styles.metaRow}>
                          <MetaBadge text={`Trust ${opportunity.trust_score}`} />

                          {(opportunity.quality_score ?? 0) > 0 && (
                            <MetaBadge
                              text={`Quality ${opportunity.quality_score}`}
                            />
                          )}

                          {opportunity.link_health === 'healthy' && (
                            <MetaBadge text="Live Link" green />
                          )}
                        </View>

                        <View style={styles.deadlineBox}>
                          <CalendarClock size={16} color="#67e8f9" />
                          <Text style={styles.deadline}>
                            Deadline: {opportunity.deadline ?? 'Check official source'}
                          </Text>
                        </View>

                        <Text style={styles.statusLabel}>Move to</Text>

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.statusRow}
                        >
                          {statuses.map(status => (
                            <Pressable
                              key={status}
                              onPress={() => updateStatus(item.id, status)}
                              style={[
                                styles.statusChip,
                                item.status === status && styles.statusChipActive
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  item.status === status &&
                                    styles.statusTextActive
                                ]}
                              >
                                {statusLabel(status)}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>

                        <View style={styles.actions}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.openButton,
                              pressed && styles.buttonPressed
                            ]}
                            onPress={() =>
                              navigation.navigate('OpportunityDetail', {
                                opportunityId: opportunity.id
                              })
                            }
                          >
                            <Text style={styles.openText}>Open Details</Text>
                            <ArrowRight size={16} color="#020617" />
                          </Pressable>

                          <Pressable
                            style={({ pressed }) => [
                              styles.removeButton,
                              pressed && styles.buttonPressed
                            ]}
                            onPress={() => removeSaved(item.id)}
                          >
                            <Trash2 size={16} color="#f87171" />
                          </Pressable>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            ) : null
          )
        )}
      </ScrollView>
    </View>
  );
}

function TrackerStat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MetaBadge({
  text,
  green
}: {
  text: string;
  green?: boolean;
}) {
  return (
    <View style={[styles.metaBadge, green && styles.metaBadgeGreen]}>
      <Text style={[styles.metaBadgeText, green && styles.metaBadgeTextGreen]}>
        {text}
      </Text>
    </View>
  );
}

function statusLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusIcon(status: SavedStatus) {
  if (status === 'saved') return <Bookmark size={19} color="#67e8f9" />;
  if (status === 'planning') return <Clock3 size={19} color="#a78bfa" />;
  if (status === 'applied') return <CheckCircle2 size={19} color="#22c55e" />;
  if (status === 'selected') return <Trophy size={19} color="#facc15" />;
  if (status === 'rejected') return <XCircle size={19} color="#f87171" />;
  return <CalendarClock size={19} color="#94a3b8" />;
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
    marginBottom: 8
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22
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
  empty: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 22
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8
  },
  emptyText: {
    color: '#94a3b8',
    lineHeight: 21,
    marginBottom: 18
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
  primaryText: {
    color: '#020617',
    fontWeight: '900'
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  sectionCount: {
    color: '#67e8f9',
    fontWeight: '900',
    backgroundColor: 'rgba(103,232,249,0.12)',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 19,
    marginBottom: 16,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12
  },
  categoryPill: {
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.2)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  category: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12
  },
  currentStatusPill: {
    backgroundColor: 'rgba(167,139,250,0.14)',
    borderColor: 'rgba(167,139,250,0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  currentStatusText: {
    color: '#c4b5fd',
    fontWeight: '900',
    fontSize: 12
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 13
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metaBadgeGreen: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.28)'
  },
  metaBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900'
  },
  metaBadgeTextGreen: {
    color: '#22c55e'
  },
  deadlineBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(103,232,249,0.07)',
    borderColor: 'rgba(103,232,249,0.16)',
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
    marginBottom: 14
  },
  deadline: {
    color: '#cbd5e1',
    flex: 1,
    fontWeight: '700'
  },
  statusLabel: {
    color: '#94a3b8',
    fontWeight: '900',
    marginBottom: 8,
    fontSize: 12,
    textTransform: 'uppercase'
  },
  statusRow: {
    marginBottom: 15
  },
  statusChip: {
    marginRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  statusChipActive: {
    backgroundColor: '#67e8f9',
    borderColor: '#67e8f9'
  },
  statusText: {
    color: '#cbd5e1',
    fontWeight: '800',
    fontSize: 12
  },
  statusTextActive: {
    color: '#020617'
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  openButton: {
    flex: 1,
    backgroundColor: '#67e8f9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7
  },
  openText: {
    color: '#020617',
    fontWeight: '900'
  },
  removeButton: {
    width: 52,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.08)'
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  }
});