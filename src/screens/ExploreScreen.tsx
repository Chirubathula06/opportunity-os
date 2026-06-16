import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowDownUp,
  BadgeCheck,
  Filter,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity } from '../types';
import { rankOpportunities } from '../utils/matching';
import { OpportunityCard } from '../components/OpportunityCard';

const categories = [
  'All',
  'Scholarships',
  'Internships',
  'Hackathons',
  'Fellowships',
  'Grants',
  'Startup',
  'Government',
  'Research',
  'Open Source',
  'Competitions',
  'Education'
];

const sorts = [
  'Best match',
  'Highest quality',
  'Deadline soon',
  'Highest trust',
  'Newest'
];

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Best match');

  async function loadOpportunities() {
    setLoading(true);

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('verification_status', 'verified')
      .gte('trust_score', 80)
      .in('status', ['active', 'upcoming'])
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(error.message);
      setOpportunities([]);
    } else {
      setOpportunities((data ?? []) as Opportunity[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOpportunities();
  }, []);

  const ranked = useMemo(() => {
    if (!profile) return [];

    let list = rankOpportunities(profile, opportunities);

    if (category !== 'All') {
      list = list.filter(item =>
        item.opportunity.category
          .toLowerCase()
          .includes(category.toLowerCase())
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();

      list = list.filter(item => {
        const op = item.opportunity;

        return (
          op.title.toLowerCase().includes(q) ||
          op.provider.toLowerCase().includes(q) ||
          op.category.toLowerCase().includes(q) ||
          op.source_domain.toLowerCase().includes(q) ||
          (op.description ?? '').toLowerCase().includes(q) ||
          (op.skills ?? []).some(skill => skill.toLowerCase().includes(q)) ||
          (op.interests ?? []).some(interest =>
            interest.toLowerCase().includes(q)
          )
        );
      });
    }

    if (sort === 'Highest quality') {
      list = [...list].sort(
        (a, b) =>
          (b.opportunity.quality_score ?? 0) -
          (a.opportunity.quality_score ?? 0)
      );
    }

    if (sort === 'Deadline soon') {
      list = [...list].sort((a, b) => {
        const da = a.opportunity.deadline_date
          ? new Date(a.opportunity.deadline_date).getTime()
          : Number.MAX_SAFE_INTEGER;

        const db = b.opportunity.deadline_date
          ? new Date(b.opportunity.deadline_date).getTime()
          : Number.MAX_SAFE_INTEGER;

        return da - db;
      });
    }

    if (sort === 'Highest trust') {
      list = [...list].sort(
        (a, b) => b.opportunity.trust_score - a.opportunity.trust_score
      );
    }

    if (sort === 'Newest') {
      list = [...list].sort(
        (a, b) =>
          new Date(b.opportunity.created_at).getTime() -
          new Date(a.opportunity.created_at).getTime()
      );
    }

    return list;
  }, [profile, opportunities, query, category, sort]);

  const averageTrust =
    opportunities.length > 0
      ? Math.round(
          opportunities.reduce((sum, item) => sum + item.trust_score, 0) /
            opportunities.length
        )
      : 0;

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
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Verified Feed</Text>
            <Text style={styles.title}>Explore Opportunities</Text>
          </View>

          <View style={styles.headerOrb}>
            <Sparkles size={24} color="#020617" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Browse 100+ verified scholarships, internships, hackathons,
          fellowships, research programs, startup opportunities, and official
          apply links.
        </Text>

        <View style={styles.statsStrip}>
          <MiniStat
            icon={<BadgeCheck size={16} color="#67e8f9" />}
            value={opportunities.length.toString()}
            label="Verified"
          />

          <View style={styles.statDivider} />

          <MiniStat
            icon={<ShieldCheck size={16} color="#22c55e" />}
            value={averageTrust.toString()}
            label="Avg Trust"
          />

          <View style={styles.statDivider} />

          <MiniStat
            icon={<Sparkles size={16} color="#a78bfa" />}
            value={ranked.length.toString()}
            label="Visible"
          />
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color="#67e8f9" />

          <TextInput
            placeholder="Search scholarships, internships, AI, Python..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>

        <View style={styles.filterHeader}>
          <View style={styles.filterLabel}>
            <Filter size={16} color="#67e8f9" />
            <Text style={styles.filterTitle}>Categories</Text>
          </View>

          <Text style={styles.filterMeta}>{category}</Text>
        </View>

        <View style={styles.horizontalClip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalRow}
            contentContainerStyle={styles.rowContent}
          >
            {categories.map(item => (
              <Chip
                key={item}
                label={item}
                active={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterHeader}>
          <View style={styles.filterLabel}>
            <ArrowDownUp size={16} color="#a78bfa" />
            <Text style={styles.filterTitle}>Sort by</Text>
          </View>

          <Text style={styles.filterMeta}>{sort}</Text>
        </View>

        <View style={styles.horizontalClip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalRow}
            contentContainerStyle={styles.rowContent}
          >
            {sorts.map(item => (
              <Chip
                key={item}
                label={item}
                active={sort === item}
                onPress={() => setSort(item)}
                purple
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.countCard}>
          <Text style={styles.countValue}>{ranked.length}</Text>
          <Text style={styles.countText}>
            verified opportunities found for your current filters
          </Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <View style={styles.loadingOrb}>
              <ActivityIndicator color="#020617" />
            </View>

            <Text style={styles.loadingTitle}>Finding verified opportunities</Text>
            <Text style={styles.loadingText}>
              Checking trusted records, match scores, and official apply links.
            </Text>
          </View>
        ) : ranked.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No opportunities found</Text>
            <Text style={styles.emptyText}>
              Try another category, remove search text, or use Best Match.
            </Text>

            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setQuery('');
                setCategory('All');
                setSort('Best match');
              }}
            >
              <Text style={styles.resetText}>Reset Filters</Text>
            </Pressable>
          </View>
        ) : (
          ranked.map(item => (
            <View key={item.opportunity.id}>
              <OpportunityCard
                opportunity={item.opportunity}
                matchScore={item.match.score}
                reason={item.match.reasons[0]}
                onPress={() =>
                  navigation.navigate('OpportunityDetail', {
                    opportunityId: item.opportunity.id
                  })
                }
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function MiniStat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.miniStat}>
      {icon}
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  purple
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  purple?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && (purple ? styles.chipActivePurple : styles.chipActive),
        pressed && styles.chipPressed
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617'
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 120
  },
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(103,232,249,0.17)'
  },
  glowTwo: {
    position: 'absolute',
    bottom: 130,
    left: -140,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(167,139,250,0.14)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  headerText: {
    flex: 1,
    minWidth: 0
  },
  eyebrow: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 6
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  headerOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    marginBottom: 16
  },
  miniStat: {
    flex: 1,
    alignItems: 'center'
  },
  miniValue: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 5
  },
  miniLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 15,
    marginBottom: 16
  },
  search: {
    flex: 1,
    color: '#fff',
    paddingVertical: 15,
    fontSize: 15,
    minWidth: 0
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  filterTitle: {
    color: '#ffffff',
    fontWeight: '900'
  },
  filterMeta: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 120
  },
  horizontalClip: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16
  },
  horizontalRow: {
    width: '100%'
  },
  rowContent: {
    paddingRight: 36
  },
  chip: {
    marginRight: 10,
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  chipActive: {
    backgroundColor: '#67e8f9',
    borderColor: '#67e8f9'
  },
  chipActivePurple: {
    backgroundColor: '#a78bfa',
    borderColor: '#a78bfa'
  },
  chipPressed: {
    transform: [{ scale: 0.97 }]
  },
  chipText: {
    color: '#cbd5e1',
    fontWeight: '800'
  },
  chipTextActive: {
    color: '#020617'
  },
  countCard: {
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16
  },
  countValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900'
  },
  countText: {
    color: '#67e8f9',
    fontWeight: '800',
    marginTop: 3
  },
  loading: {
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
    marginBottom: 16
  },
  loadingTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 6
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 21
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
    lineHeight: 21,
    marginBottom: 16
  },
  resetButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  resetText: {
    color: '#020617',
    fontWeight: '900'
  }
});