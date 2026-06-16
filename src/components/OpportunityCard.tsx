import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Opportunity } from '../types';

type Props = {
  opportunity: Opportunity;
  matchScore?: number;
  reason?: string;
  onPress?: () => void;
};

export function OpportunityCard({
  opportunity,
  matchScore,
  reason,
  onPress
}: Props) {
  const quality = opportunity.quality_score ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Sparkles size={13} color="#67e8f9" />
          <Text style={styles.category}>{opportunity.category}</Text>
        </View>

        {typeof matchScore === 'number' && (
          <View style={styles.matchPill}>
            <Text style={styles.matchText}>{matchScore}% match</Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {opportunity.title}
      </Text>

      <Text numberOfLines={1} style={styles.provider}>
        {opportunity.provider}
      </Text>

      <View style={styles.badges}>
        <Badge text={`Trust ${opportunity.trust_score}`} color="#a78bfa" />

        {quality > 0 && (
          <Badge text={`Quality ${quality}`} color="#c084fc" />
        )}

        {opportunity.link_health === 'healthy' && (
          <Badge text="Live Link" color="#06b6d4" icon="shield" />
        )}

        {opportunity.freshness_label === 'new' && (
          <Badge text="New" color="#22c55e" />
        )}

        {opportunity.urgency_label === 'closing_soon' && (
          <Badge text="Closing Soon" color="#f97316" />
        )}
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Deadline</Text>
        <Text style={styles.metaValue}>
          {opportunity.deadline ?? 'Check official source'}
        </Text>
      </View>

      {reason ? (
        <Text numberOfLines={2} style={styles.reason}>
          {reason}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.source}>
          {opportunity.source_domain}
        </Text>

        <ExternalLink size={15} color="#64748b" />
      </View>
    </Pressable>
  );
}

function Badge({
  text,
  color,
  icon
}: {
  text: string;
  color: string;
  icon?: 'shield';
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: color,
          backgroundColor: `${color}18`
        }
      ]}
    >
      {icon === 'shield' && <ShieldCheck size={12} color={color} />}
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderColor: 'rgba(148,163,184,0.18)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: 'rgba(103,232,249,0.45)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(103,232,249,0.1)',
    borderColor: 'rgba(103,232,249,0.24)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  category: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12
  },
  matchPill: {
    backgroundColor: 'rgba(103,232,249,0.18)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  matchText: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 12
  },
  title: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.3
  },
  provider: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 12
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900'
  },
  metaBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  metaValue: {
    color: '#cbd5e1',
    fontWeight: '700'
  },
  reason: {
    color: '#e0f2fe',
    marginBottom: 10,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  source: {
    color: '#64748b',
    fontSize: 12,
    flex: 1
  }
});