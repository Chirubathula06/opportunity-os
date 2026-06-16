import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  Target,
  UserRound,
  X
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const roles: UserRole[] = [
  'Student',
  'Developer',
  'Founder',
  'Professional',
  'Researcher',
  'Citizen'
];

const educationLevels = [
  'School',
  'Intermediate',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'PhD',
  'Graduate',
  'Other'
];

const fields = [
  'AI',
  'Computer Science',
  'Engineering',
  'Business',
  'Medical',
  'Law',
  'Arts',
  'Design',
  'Research',
  'Agriculture',
  'Other'
];

const years = [
  '1st year',
  '2nd year',
  '3rd year',
  'Final year',
  'Graduate',
  'Not applicable'
];

const interestsList = [
  'Scholarships',
  'Internships',
  'Hackathons',
  'Fellowships',
  'Grants',
  'Startup Programs',
  'Competitions',
  'Government Benefits',
  'Research',
  'Open Source',
  'Funding',
  'Global Opportunities'
];

const skillsList = [
  'AI',
  'Machine Learning',
  'Python',
  'React',
  'React Native',
  'Full Stack',
  'Data Science',
  'Cloud',
  'Cybersecurity',
  'UI/UX',
  'Design',
  'Marketing',
  'Business',
  'Research',
  'Writing',
  'Leadership',
  'Open Source'
];

export function ProfileBuilderScreen() {
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);

  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [currentYear, setCurrentYear] = useState('');

  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [incomeRange, setIncomeRange] = useState('');

  const [saving, setSaving] = useState(false);

  const progress = useMemo(() => step / 4, [step]);

  function toggleValue(
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  }

  function addCustomSkill() {
    const cleanSkill = customSkill.trim();

    if (!cleanSkill) return;

    const alreadyExists = skills.some(
      item => item.toLowerCase() === cleanSkill.toLowerCase()
    );

    if (alreadyExists) {
      setCustomSkill('');
      return;
    }

    setSkills([...skills, cleanSkill]);
    setCustomSkill('');
  }

  function removeSkill(value: string) {
    setSkills(skills.filter(item => item !== value));
  }

  function nextStep() {
    if (step === 1 && !role) {
      Alert.alert('Choose your role', 'Select what best describes you.');
      return;
    }

    if (step === 2) {
      if (!country.trim() || !educationLevel || !fieldOfStudy || !currentYear) {
        Alert.alert(
          'Missing details',
          'Please complete your location and background.'
        );
        return;
      }
    }

    if (step === 3 && interests.length === 0) {
      Alert.alert('Select interests', 'Choose at least one opportunity type.');
      return;
    }

    setStep(step + 1);
  }

  async function finishProfile() {
    if (skills.length === 0) {
      Alert.alert('Select skills', 'Choose at least one skill.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Session error', 'Please login again.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        role,
        country: country.trim(),
        state: stateName.trim(),
        city: city.trim(),
        education_level: educationLevel,
        field_of_study: fieldOfStudy,
        current_year: currentYear,
        gender: gender.trim() || null,
        category: category.trim() || null,
        income_range: incomeRange.trim() || null,
        interests,
        skills,
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Profile save failed', error.message);
      return;
    }

    await refreshProfile();
  }

  const stepInfo = getStepInfo(step);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#020617', '#050816', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>Opportunity OS</Text>
              <Text style={styles.stepText}>Step {step} of 4</Text>
            </View>

            <View style={styles.aiBadge}>
              <BrainCircuit size={16} color="#67e8f9" />
              <Text style={styles.aiBadgeText}>AI profile setup</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>{stepInfo.icon}</View>

            <Text style={styles.title}>{stepInfo.title}</Text>
            <Text style={styles.subtitle}>{stepInfo.subtitle}</Text>
          </View>

          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Choose your identity</Text>

              <View style={styles.grid}>
                {roles.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={role === item}
                    onPress={() => setRole(item)}
                  />
                ))}
              </View>

              <InfoBox text="This controls eligibility matching for scholarships, internships, fellowships, grants, startup programs, and government benefits." />
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Location</Text>

              <Input placeholder="Country" value={country} onChangeText={setCountry} />
              <Input placeholder="State / Region" value={stateName} onChangeText={setStateName} />
              <Input placeholder="City" value={city} onChangeText={setCity} />

              <Text style={styles.sectionTitle}>Education level</Text>
              <View style={styles.grid}>
                {educationLevels.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={educationLevel === item}
                    onPress={() => setEducationLevel(item)}
                  />
                ))}
              </View>

              <Text style={styles.sectionTitle}>Field of study / work</Text>
              <View style={styles.grid}>
                {fields.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={fieldOfStudy === item}
                    onPress={() => setFieldOfStudy(item)}
                  />
                ))}
              </View>

              <Text style={styles.sectionTitle}>Current year</Text>
              <View style={styles.grid}>
                {years.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={currentYear === item}
                    onPress={() => setCurrentYear(item)}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Opportunity preferences</Text>

              <View style={styles.grid}>
                {interestsList.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={interests.includes(item)}
                    onPress={() => toggleValue(item, interests, setInterests)}
                  />
                ))}
              </View>

              <View style={styles.selectionSummary}>
                <Text style={styles.summaryValue}>{interests.length}</Text>
                <Text style={styles.summaryText}>interests selected</Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Suggested skills</Text>

              <View style={styles.grid}>
                {skillsList.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    active={skills.includes(item)}
                    onPress={() => toggleValue(item, skills, setSkills)}
                  />
                ))}
              </View>

              <Text style={styles.sectionTitle}>Add your own skill</Text>

              <View style={styles.customSkillBox}>
                <TextInput
                  placeholder="Example: Flutter, Finance, Public Speaking"
                  placeholderTextColor="#64748b"
                  value={customSkill}
                  onChangeText={setCustomSkill}
                  style={styles.customSkillInput}
                  onSubmitEditing={addCustomSkill}
                  returnKeyType="done"
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.addSkillButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={addCustomSkill}
                >
                  <Plus size={18} color="#020617" />
                </Pressable>
              </View>

              {skills.length > 0 && (
                <>
                  <Text style={styles.selectedLabel}>Selected skills</Text>

                  <View style={styles.grid}>
                    {skills.map(item => (
                      <SelectedSkill
                        key={item}
                        label={item}
                        onRemove={() => removeSkill(item)}
                      />
                    ))}
                  </View>
                </>
              )}

              <View style={styles.selectionSummary}>
                <Text style={styles.summaryValue}>{skills.length}</Text>
                <Text style={styles.summaryText}>skills selected</Text>
              </View>

              <Text style={styles.sectionTitle}>Optional eligibility</Text>

              <Input
                placeholder="Gender optional"
                value={gender}
                onChangeText={setGender}
              />
              <Input
                placeholder="Category optional"
                value={category}
                onChangeText={setCategory}
              />
              <Input
                placeholder="Income range optional"
                value={incomeRange}
                onChangeText={setIncomeRange}
              />

              <InfoBox text="Optional eligibility fields improve matching for specific scholarships, government benefits, and fellowships." />
            </View>
          )}

          <View style={styles.footer}>
            {step > 1 && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={() => setStep(step - 1)}
              >
                <ArrowLeft size={18} color="#ffffff" />
                <Text style={styles.secondaryText}>Back</Text>
              </Pressable>
            )}

            {step < 4 ? (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryText}>Continue</Text>
                <ArrowRight size={18} color="#020617" />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  saving && styles.disabledButton
                ]}
                onPress={finishProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <>
                    <Text style={styles.primaryText}>Launch Dashboard</Text>
                    <ArrowRight size={18} color="#020617" />
                  </>
                )}
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function getStepInfo(step: number) {
  if (step === 1) {
    return {
      title: 'Who are you?',
      subtitle:
        'Tell us your role so Opportunity OS can rank only the opportunities that actually fit you.',
      icon: <UserRound size={26} color="#020617" />
    };
  }

  if (step === 2) {
    return {
      title: 'Where are you eligible?',
      subtitle:
        'Location, education, and field help us filter scholarships, internships, and government programs.',
      icon: <MapPin size={26} color="#020617" />
    };
  }

  if (step === 3) {
    return {
      title: 'What are you looking for?',
      subtitle:
        'Choose opportunity types you care about. Your dashboard will be personalized around them.',
      icon: <Target size={26} color="#020617" />
    };
  }

  return {
    title: 'Build your AI match profile',
    subtitle:
      'Choose suggested skills or add your own. Skills power your match score and recommendations.',
    icon: <GraduationCap size={26} color="#020617" />
  };
}

function Chip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed
      ]}
    >
      {active && <Check size={13} color="#020617" />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SelectedSkill({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.selectedSkill}>
      <Text style={styles.selectedSkillText}>{label}</Text>

      <Pressable onPress={onRemove} style={styles.removeSkillButton}>
        <X size={13} color="#020617" />
      </Pressable>
    </View>
  );
}

function Input({
  placeholder,
  value,
  onChangeText
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
    />
  );
}

function InfoBox({ text }: { text: string }) {
  return (
    <View style={styles.infoBox}>
      <BadgeCheck size={17} color="#67e8f9" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617'
  },
  keyboard: {
    flex: 1
  },
  content: {
    padding: 22,
    paddingTop: 58,
    paddingBottom: 44
  },
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: 'rgba(103,232,249,0.17)'
  },
  glowTwo: {
    position: 'absolute',
    bottom: -120,
    left: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167,139,250,0.15)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 18
  },
  logo: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
    marginBottom: 5
  },
  stepText: {
    color: '#94a3b8',
    fontWeight: '800',
    fontSize: 13
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderColor: 'rgba(103,232,249,0.28)',
    borderWidth: 1,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  aiBadgeText: {
    color: '#cbd5e1',
    fontWeight: '800',
    fontSize: 12
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 22
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#67e8f9',
    borderRadius: 999
  },
  heroCard: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.13,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 10
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 23,
    fontSize: 15
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginBottom: 18
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 4
  },
  selectedLabel: {
    color: '#94a3b8',
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    fontSize: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  chipActive: {
    backgroundColor: '#67e8f9',
    borderColor: '#67e8f9'
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
  customSkillBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  customSkillInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    color: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16
  },
  addSkillButton: {
    width: 54,
    borderRadius: 18,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#67e8f9',
    borderRadius: 999,
    paddingVertical: 9,
    paddingLeft: 14,
    paddingRight: 8
  },
  selectedSkillText: {
    color: '#020617',
    fontWeight: '900'
  },
  removeSkillButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(2,6,23,0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    color: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 12
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 12
  },
  infoText: {
    color: '#cbd5e1',
    lineHeight: 20,
    fontSize: 13,
    flex: 1,
    fontWeight: '700'
  },
  selectionSummary: {
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900'
  },
  summaryText: {
    color: '#67e8f9',
    fontWeight: '800'
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  primaryText: {
    color: '#020617',
    fontWeight: '900'
  },
  secondaryButton: {
    flex: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  secondaryText: {
    color: '#ffffff',
    fontWeight: '900'
  },
  disabledButton: {
    opacity: 0.7
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }]
  }
});