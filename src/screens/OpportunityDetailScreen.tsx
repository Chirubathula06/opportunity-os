import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gift,
  Lightbulb,
  Medal,
  Share2,
  ShieldCheck,
  Sparkles
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Opportunity, SavedStatus } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { calculateMatch } from '../utils/matching';
import { getTrustExplanation } from '../utils/trust';

type DetailRoute = RouteProp<RootStackParamList, 'OpportunityDetail'>;

export function OpportunityDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<any>();
  const { profile, user } = useAuth();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadOpportunity() {
    setLoading(true);

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', route.params.opportunityId)
      .single();

    if (error) {
      console.warn(error.message);
      setOpportunity(null);
    } else {
      setOpportunity(data as Opportunity);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOpportunity();
  }, [route.params.opportunityId]);

  const match = useMemo(() => {
    if (!profile || !opportunity) return null;
    return calculateMatch(profile, opportunity);
  }, [profile, opportunity]);

  async function saveOpportunity(status: SavedStatus = 'saved') {
    if (!user?.id || !opportunity?.id) return;

    setSaving(true);

    const { error } = await supabase.from('saved_opportunities').upsert(
      {
        user_id: user.id,
        opportunity_id: opportunity.id,
        status,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,opportunity_id' }
    );

    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    Alert.alert('Saved', 'Opportunity added to your tracker.');
  }

  async function openOfficialSource() {
    if (!opportunity?.official_url) return;

    const canOpen = await Linking.canOpenURL(opportunity.official_url);

    if (!canOpen) {
      Alert.alert('Cannot open link', 'The official source link is unavailable.');
      return;
    }

    await Linking.openURL(opportunity.official_url);
  }

  async function shareOpportunity() {
    if (!opportunity) return;

    await Share.share({
      message: `${opportunity.title} by ${opportunity.provider}\n${opportunity.official_url}`
    });
  }

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

        <Text style={styles.loadingTitle}>Loading verified opportunity</Text>
        <Text style={styles.loadingText}>
          Checking match score, trust signals, details, and official source.
        </Text>
      </View>
    );
  }

  if (!opportunity) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#050816', '#111827']}
          style={StyleSheet.absoluteFill}
        />

        <Text style={styles.errorTitle}>Opportunity not found</Text>

        <Pressable style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
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

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.categoryPill}>
              <Sparkles size={14} color="#67e8f9" />
              <Text style={styles.category}>{opportunity.category}</Text>
            </View>

            {opportunity.link_health === 'healthy' && (
              <View style={styles.livePill}>
                <ShieldCheck size={14} color="#22c55e" />
                <Text style={styles.livePillText}>Live Link</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{opportunity.title}</Text>

          <Text style={styles.provider}>
            {opportunity.provider} · {opportunity.country ?? 'Global'}
          </Text>

          <View style={styles.metaRow}>
            <Badge label={`${match?.score ?? 0}% Match`} color="#67e8f9" dark />
            <Badge label={`Trust ${opportunity.trust_score}`} color="#a78bfa" />
            {(opportunity.quality_score ?? 0) > 0 && (
              <Badge label={`Quality ${opportunity.quality_score}`} color="#22c55e" />
            )}
            <Badge label={opportunity.status} color="#facc15" dark />
          </View>

          <View style={styles.deadlineBox}>
            <Text style={styles.deadlineLabel}>Deadline</Text>
            <Text style={styles.deadlineValue}>
              {opportunity.deadline ?? 'Check official source'}
            </Text>
          </View>
        </View>

        <Card
          title="Description"
          icon={<FileText size={19} color="#67e8f9" />}
        >
          <Text style={styles.body}>
            {opportunity.description ?? 'No description available.'}
          </Text>
        </Card>

        <Card
          title="Why you match"
          icon={<CheckCircle2 size={19} color="#22c55e" />}
        >
          {(match?.reasons.length
            ? match.reasons
            : ['Your profile has relevant overlap with this opportunity.']
          ).map(item => (
            <Line key={item} type="good" text={item} />
          ))}
        </Card>

        <Card
          title="Missing requirements"
          icon={<AlertTriangle size={19} color="#f59e0b" />}
        >
          {(match?.missingRequirements.length
            ? match.missingRequirements
            : ['No major missing requirements detected.']
          ).map(item => (
            <Line key={item} type="warn" text={item} />
          ))}
        </Card>

        <Card
          title="Recommended action"
          icon={<Lightbulb size={19} color="#facc15" />}
        >
          <Text style={styles.body}>
            {match?.recommendedAction ??
              'Review the official source and prepare your application.'}
          </Text>
        </Card>

        <Card title="Benefits" icon={<Gift size={19} color="#a78bfa" />}>
          {(opportunity.benefits?.length
            ? opportunity.benefits
            : ['Check official source.']
          ).map(item => (
            <Line key={item} type="normal" text={item} />
          ))}
        </Card>

        <Card
          title="Documents required"
          icon={<FileText size={19} color="#67e8f9" />}
        >
          {(opportunity.documents_required?.length
            ? opportunity.documents_required
            : ['Check official source.']
          ).map(item => (
            <Line key={item} type="normal" text={item} />
          ))}
        </Card>

        <Card
          title="Verification"
          icon={<Medal size={19} color="#22c55e" />}
        >
          <Text style={styles.body}>{getTrustExplanation(opportunity)}</Text>

          <View style={styles.sourceBox}>
            <Text style={styles.sourceLabel}>Official source domain</Text>
            <Text style={styles.source}>{opportunity.source_domain}</Text>
          </View>

          <View style={styles.verificationGrid}>
            <MiniTrust label="Trust" value={opportunity.trust_score.toString()} />
            <MiniTrust
              label="Quality"
              value={(opportunity.quality_score ?? 0).toString()}
            />
            <MiniTrust
              label="Link"
              value={opportunity.link_health ?? 'unknown'}
            />
          </View>
        </Card>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            saving && styles.disabledButton
          ]}
          onPress={() => saveOpportunity()}
          disabled={saving}
        >
          <Bookmark size={18} color="#020617" />
          <Text style={styles.primaryText}>
            {saving ? 'Saving...' : 'Save Opportunity'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            pressed && styles.buttonPressed
          ]}
          onPress={openOfficialSource}
        >
          <ExternalLink size={18} color="#020617" />
          <Text style={styles.applyText}>Apply from Official Source</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed
          ]}
          onPress={shareOpportunity}
        >
          <Share2 size={18} color="#ffffff" />
          <Text style={styles.secondaryText}>Share Opportunity</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Badge({
  label,
  color,
  dark
}: {
  label: string;
  color: string;
  dark?: boolean;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.badgeText, { color: dark ? color : '#ffffff' }]}>
        {label}
      </Text>
    </View>
  );
}

function Card({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

function Line({
  text,
  type
}: {
  text: string;
  type: 'good' | 'warn' | 'normal';
}) {
  const color =
    type === 'good' ? '#bbf7d0' : type === 'warn' ? '#fde68a' : '#cbd5e1';

  const icon =
    type === 'good' ? '✓' : type === 'warn' ? '!' : '•';

  return (
    <View style={styles.lineRow}>
      <Text style={[styles.lineIcon, { color }]}>{icon}</Text>
      <Text style={[styles.bullet, { color }]}>{text}</Text>
    </View>
  );
}

function MiniTrust({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniTrust}>
      <Text style={styles.miniTrustValue}>{value}</Text>
      <Text style={styles.miniTrustLabel}>{label}</Text>
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
  errorTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16
  },
  errorButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  errorButtonText: {
    color: '#020617',
    fontWeight: '900'
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
    marginBottom: 18
  },
  backText: {
    color: '#cbd5e1',
    fontWeight: '900'
  },
  heroCard: {
    backgroundColor: 'rgba(15,23,42,0.84)',
    borderColor: 'rgba(103,232,249,0.22)',
    borderWidth: 1,
    borderRadius: 32,
    padding: 21,
    marginBottom: 16,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  category: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.28)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  livePillText: {
    color: '#22c55e',
    fontWeight: '900',
    fontSize: 12
  },
  title: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 8
  },
  provider: {
    color: '#cbd5e1',
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 15
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  badgeText: {
    fontWeight: '900',
    fontSize: 12
  },
  deadlineBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14
  },
  deadlineLabel: {
    color: '#64748b',
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  deadlineValue: {
    color: '#ffffff',
    fontWeight: '900'
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    flex: 1
  },
  body: {
    color: '#cbd5e1',
    lineHeight: 22
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 8
  },
  lineIcon: {
    width: 18,
    fontWeight: '900'
  },
  bullet: {
    lineHeight: 22,
    flex: 1
  },
  sourceBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
    marginBottom: 12
  },
  sourceLabel: {
    color: '#64748b',
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  source: {
    color: '#67e8f9',
    fontWeight: '900'
  },
  verificationGrid: {
    flexDirection: 'row',
    gap: 10
  },
  miniTrust: {
    flex: 1,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.16)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center'
  },
  miniTrustValue: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18
  },
  miniTrustLabel: {
    color: '#67e8f9',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 3
  },
  primaryButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  primaryText: {
    color: '#020617',
    fontWeight: '900'
  },
  applyButton: {
    backgroundColor: '#a78bfa',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  applyText: {
    color: '#020617',
    fontWeight: '900'
  },
  secondaryButton: {
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '900'
  },
  disabledButton: {
    opacity: 0.7
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  }
});