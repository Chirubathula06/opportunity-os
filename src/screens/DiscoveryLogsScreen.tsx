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
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCcw,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  XCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type SyncLog = {
  id: string;
  status: string | null;
  found_count: number | null;
  verified_count: number | null;
  rejected_count: number | null;
  notes: string | null;
  created_at: string;
};

export function DiscoveryLogsScreen() {
  const navigation = useNavigation<any>();

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from('opportunity_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      console.warn(error.message);
      setLogs([]);
    } else {
      setLogs((data ?? []) as SyncLog[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const summary = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        acc.found += item.found_count ?? 0;
        acc.verified += item.verified_count ?? 0;
        acc.rejected += item.rejected_count ?? 0;

        if (item.status === 'completed') acc.completed += 1;
        if (item.status === 'failed') acc.failed += 1;

        return acc;
      },
      {
        found: 0,
        verified: 0,
        rejected: 0,
        completed: 0,
        failed: 0
      }
    );
  }, [logs]);

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
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={18} color="#cbd5e1" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Admin Engine</Text>
            <Text style={styles.title}>AI Discovery Logs</Text>
          </View>

          <View style={styles.headerOrb}>
            <ServerCog size={25} color="#020617" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Monitor automatic source discovery, AI extraction, verification,
          rejection reasons, and opportunity sync health.
        </Text>

        <View style={styles.heroCard}>
          <SearchCheck size={22} color="#67e8f9" />

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Opportunity engine status</Text>
            <Text style={styles.heroText}>
              This screen is for admin testing. Normal users should not see
              discovery logs in production.
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <SummaryStat
            icon={<SearchCheck size={18} color="#67e8f9" />}
            value={summary.found.toString()}
            label="Found"
          />

          <SummaryStat
            icon={<ShieldCheck size={18} color="#22c55e" />}
            value={summary.verified.toString()}
            label="Verified"
          />

          <SummaryStat
            icon={<AlertTriangle size={18} color="#f59e0b" />}
            value={summary.rejected.toString()}
            label="Rejected"
          />

          <SummaryStat
            icon={<XCircle size={18} color="#f87171" />}
            value={summary.failed.toString()}
            label="Failed Runs"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.buttonPressed
          ]}
          onPress={loadLogs}
        >
          <RefreshCcw size={18} color="#020617" />
          <Text style={styles.refreshText}>Refresh Logs</Text>
        </Pressable>

        {loading ? (
          <View style={styles.center}>
            <View style={styles.loadingOrb}>
              <ActivityIndicator color="#020617" />
            </View>

            <Text style={styles.loadingTitle}>Loading discovery logs</Text>
            <Text style={styles.loadingText}>
              Reading recent sync runs from Supabase.
            </Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyText}>
              Run the discovery function once to generate sync logs.
            </Text>
          </View>
        ) : (
          logs.map(log => (
            <View key={log.id} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.statusWrap}>
                  {log.status === 'completed' ? (
                    <CheckCircle2 size={17} color="#22c55e" />
                  ) : log.status === 'failed' ? (
                    <XCircle size={17} color="#f87171" />
                  ) : (
                    <AlertTriangle size={17} color="#f59e0b" />
                  )}

                  <Text
                    style={[
                      styles.status,
                      log.status === 'failed' && styles.statusFailed
                    ]}
                  >
                    {log.status ?? 'unknown'}
                  </Text>
                </View>

                <Text style={styles.date}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>

              <View style={styles.stats}>
                <Stat label="Found" value={log.found_count ?? 0} />
                <Stat label="Verified" value={log.verified_count ?? 0} />
                <Stat label="Rejected" value={log.rejected_count ?? 0} />
              </View>

              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notes}>
                  {log.notes || 'No notes recorded.'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function SummaryStat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>{icon}</View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    paddingBottom: 110
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
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 20
  },
  backText: {
    color: '#cbd5e1',
    fontWeight: '900'
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
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.2)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 18
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 5
  },
  heroText: {
    color: '#94a3b8',
    lineHeight: 20,
    fontSize: 13
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900'
  },
  summaryLabel: {
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '800'
  },
  refreshButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  refreshText: {
    color: '#020617',
    fontWeight: '900'
  },
  center: {
    padding: 30,
    alignItems: 'center'
  },
  loadingOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  loadingTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 6
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center'
  },
  empty: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 22
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900'
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 21
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  status: {
    color: '#22c55e',
    fontWeight: '900',
    textTransform: 'capitalize'
  },
  statusFailed: {
    color: '#f87171'
  },
  date: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
    textAlign: 'right'
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.14)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center'
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '800'
  },
  notesBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 14
  },
  notesTitle: {
    color: '#fff',
    fontWeight: '900',
    marginBottom: 6
  },
  notes: {
    color: '#cbd5e1',
    lineHeight: 21
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  }
});