import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BadgeCheck,
  BrainCircuit,
  Edit3,
  GraduationCap,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  UserRound
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, user, signOut } = useAuth();

  const completion = calculateCompletion(profile);

  async function handleLogout() {
    Alert.alert('Logout?', 'You will be signed out of Opportunity OS.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        }
      }
    ]);
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>Your AI Identity</Text>
            <Text style={styles.title}>Profile</Text>
          </View>

          <View style={styles.headerOrb}>
            <UserRound size={25} color="#020617" />
          </View>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.full_name ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {profile?.full_name ?? 'Opportunity Explorer'}
          </Text>

          <Text style={styles.email}>{profile?.email ?? user?.email}</Text>

          <View style={styles.completionBox}>
            <Text style={styles.completionValue}>{completion}%</Text>
            <Text style={styles.completionLabel}>Profile Completion</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(6, completion)}%` }
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.aiCard}>
          <BrainCircuit size={21} color="#67e8f9" />

          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI matching profile active</Text>
            <Text style={styles.aiText}>
              Your role, location, interests, and skills are used to rank
              verified opportunities and explain why each match fits you.
            </Text>
          </View>
        </View>

        <Section
          title="Identity"
          icon={<UserRound size={19} color="#67e8f9" />}
        >
          <Info label="Role" value={profile?.role} />
          <Info label="Education" value={profile?.education_level} />
          <Info label="Field" value={profile?.field_of_study} />
          <Info label="Current Year" value={profile?.current_year} />
        </Section>

        <Section
          title="Location"
          icon={<MapPin size={19} color="#a78bfa" />}
        >
          <Info label="Country" value={profile?.country} />
          <Info label="State" value={profile?.state} />
          <Info label="City" value={profile?.city} />
        </Section>

        <Section
          title="Skills"
          icon={<Sparkles size={19} color="#22c55e" />}
        >
          <TagList values={profile?.skills ?? []} />
        </Section>

        <Section
          title="Interests"
          icon={<Tag size={19} color="#facc15" />}
        >
          <TagList values={profile?.interests ?? []} />
        </Section>

        <Section
          title="Eligibility"
          icon={<GraduationCap size={19} color="#f97316" />}
        >
          <Info label="Gender" value={profile?.gender} />
          <Info label="Category" value={profile?.category} />
          <Info label="Income Range" value={profile?.income_range} />
        </Section>

        <View style={styles.trustCard}>
          <ShieldCheck size={21} color="#67e8f9" />

          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Privacy-first matching</Text>
            <Text style={styles.trustText}>
              Your profile is used only to personalize opportunity ranking,
              saved tracking, and eligibility recommendations.
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Edit3 size={18} color="#020617" />
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed
          ]}
          onPress={handleLogout}
        >
          <LogOut size={18} color="#f87171" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

function Info({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) {
  const hasValue = Boolean(value);

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={[styles.infoValue, !hasValue && styles.infoMissing]}>
        {value || 'Not added'}
      </Text>
    </View>
  );
}

function TagList({ values }: { values: string[] }) {
  if (!values.length) {
    return (
      <View style={styles.emptyTagBox}>
        <BadgeCheck size={17} color="#94a3b8" />
        <Text style={styles.emptyText}>Nothing added yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tags}>
      {values.map(value => (
        <View key={value} style={styles.tag}>
          <Text style={styles.tagText}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function calculateCompletion(profile: any) {
  if (!profile) return 0;

  const fields = [
    profile.full_name,
    profile.email,
    profile.role,
    profile.country,
    profile.education_level,
    profile.field_of_study,
    profile.current_year,
    profile.skills?.length,
    profile.interests?.length
  ];

  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'center',
    marginBottom: 18
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
  headerCard: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(103,232,249,0.22)',
    borderWidth: 1,
    borderRadius: 32,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 8
  },
  avatarText: {
    color: '#020617',
    fontSize: 36,
    fontWeight: '900'
  },
  name: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4
  },
  email: {
    color: '#94a3b8',
    marginBottom: 18
  },
  completionBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    width: '100%',
    alignItems: 'center'
  },
  completionValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900'
  },
  completionLabel: {
    color: '#67e8f9',
    fontWeight: '900',
    marginBottom: 12
  },
  progressTrack: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#67e8f9',
    borderRadius: 999
  },
  aiCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14
  },
  aiTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 5
  },
  aiText: {
    color: '#94a3b8',
    lineHeight: 20,
    fontSize: 13
  },
  section: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 14
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 9,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: '800'
  },
  infoValue: {
    color: '#ffffff',
    fontWeight: '900',
    flex: 1,
    textAlign: 'right'
  },
  infoMissing: {
    color: '#64748b'
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  tag: {
    backgroundColor: 'rgba(103,232,249,0.14)',
    borderColor: 'rgba(103,232,249,0.28)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  tagText: {
    color: '#67e8f9',
    fontWeight: '900'
  },
  emptyTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 13
  },
  emptyText: {
    color: '#94a3b8',
    fontWeight: '800'
  },
  trustCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.18)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16
  },
  trustTitle: {
    color: '#ffffff',
    fontWeight: '900',
    marginBottom: 5
  },
  trustText: {
    color: '#94a3b8',
    lineHeight: 20,
    fontSize: 13
  },
  editButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  editText: {
    color: '#020617',
    fontWeight: '900'
  },
  logoutButton: {
    borderColor: 'rgba(248,113,113,0.5)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(248,113,113,0.08)'
  },
  logoutText: {
    color: '#f87171',
    fontWeight: '900'
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  }
});