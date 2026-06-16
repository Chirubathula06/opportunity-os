import { useState } from 'react';
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
  BadgeCheck,
  Check,
  Edit3,
  Plus,
  Save,
  Sparkles,
  Target,
  X
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, user, refreshProfile } = useAuth();

  const [country, setCountry] = useState(profile?.country ?? '');
  const [stateName, setStateName] = useState(profile?.state ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [educationLevel, setEducationLevel] = useState(
    profile?.education_level ?? ''
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    profile?.field_of_study ?? ''
  );
  const [currentYear, setCurrentYear] = useState(profile?.current_year ?? '');
  const [gender, setGender] = useState(profile?.gender ?? '');
  const [category, setCategory] = useState(profile?.category ?? '');
  const [incomeRange, setIncomeRange] = useState(profile?.income_range ?? '');

  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [interests, setInterests] = useState<string[]>(
    profile?.interests ?? []
  );

  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const [saving, setSaving] = useState(false);

  function toggle(
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) {
    setList(
      list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value]
    );
  }

  function addCustomSkill() {
    const clean = customSkill.trim();

    if (!clean) return;

    const exists = skills.some(
      item => item.toLowerCase() === clean.toLowerCase()
    );

    if (!exists) {
      setSkills([...skills, clean]);
    }

    setCustomSkill('');
  }

  function addCustomInterest() {
    const clean = customInterest.trim();

    if (!clean) return;

    const exists = interests.some(
      item => item.toLowerCase() === clean.toLowerCase()
    );

    if (!exists) {
      setInterests([...interests, clean]);
    }

    setCustomInterest('');
  }

  function removeSkill(value: string) {
    setSkills(skills.filter(item => item !== value));
  }

  function removeInterest(value: string) {
    setInterests(interests.filter(item => item !== value));
  }

  async function saveProfile() {
    if (!user?.id) {
      Alert.alert('Session error', 'Please login again.');
      return;
    }

    if (!country.trim()) {
      Alert.alert('Missing country', 'Country helps improve eligibility matching.');
      return;
    }

    if (!skills.length) {
      Alert.alert('Missing skills', 'Add at least one skill.');
      return;
    }

    if (!interests.length) {
      Alert.alert('Missing interests', 'Add at least one interest.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        country: country.trim(),
        state: stateName.trim(),
        city: city.trim(),
        education_level: educationLevel.trim(),
        field_of_study: fieldOfStudy.trim(),
        current_year: currentYear.trim(),
        gender: gender.trim() || null,
        category: category.trim() || null,
        income_range: incomeRange.trim() || null,
        skills,
        interests,
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }

    await refreshProfile();
    navigation.goBack();
  }

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
              <Text style={styles.eyebrow}>Improve AI Matching</Text>
              <Text style={styles.title}>Edit Profile</Text>
            </View>

            <View style={styles.headerOrb}>
              <Edit3 size={24} color="#020617" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Update your eligibility, skills, interests, and background so AI
            can rank better opportunities for you.
          </Text>

          <View style={styles.infoCard}>
            <BadgeCheck size={20} color="#67e8f9" />
            <Text style={styles.infoText}>
              Better profile data means better match scores, fewer irrelevant
              opportunities, and stronger recommendations.
            </Text>
          </View>

          <Section title="Location & background">
            <Input
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />
            <Input
              placeholder="State / Region"
              value={stateName}
              onChangeText={setStateName}
            />
            <Input placeholder="City" value={city} onChangeText={setCity} />
            <Input
              placeholder="Education level"
              value={educationLevel}
              onChangeText={setEducationLevel}
            />
            <Input
              placeholder="Field of study / work"
              value={fieldOfStudy}
              onChangeText={setFieldOfStudy}
            />
            <Input
              placeholder="Current year"
              value={currentYear}
              onChangeText={setCurrentYear}
            />
          </Section>

          <Section title="Skills">
            <View style={styles.grid}>
              {skillsList.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={skills.includes(item)}
                  onPress={() => toggle(item, skills, setSkills)}
                />
              ))}
            </View>

            <Text style={styles.smallLabel}>Add custom skill</Text>

            <View style={styles.customBox}>
              <TextInput
                placeholder="Example: Flutter, Finance, Public Speaking"
                placeholderTextColor="#64748b"
                value={customSkill}
                onChangeText={setCustomSkill}
                style={styles.customInput}
                onSubmitEditing={addCustomSkill}
                returnKeyType="done"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={addCustomSkill}
              >
                <Plus size={18} color="#020617" />
              </Pressable>
            </View>

            {skills.length > 0 && (
              <>
                <Text style={styles.smallLabel}>Selected skills</Text>

                <View style={styles.grid}>
                  {skills.map(item => (
                    <SelectedTag
                      key={item}
                      label={item}
                      onRemove={() => removeSkill(item)}
                    />
                  ))}
                </View>
              </>
            )}
          </Section>

          <Section title="Interests">
            <View style={styles.grid}>
              {interestsList.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={interests.includes(item)}
                  onPress={() => toggle(item, interests, setInterests)}
                />
              ))}
            </View>

            <Text style={styles.smallLabel}>Add custom interest</Text>

            <View style={styles.customBox}>
              <TextInput
                placeholder="Example: Conferences, Finance, Design contests"
                placeholderTextColor="#64748b"
                value={customInterest}
                onChangeText={setCustomInterest}
                style={styles.customInput}
                onSubmitEditing={addCustomInterest}
                returnKeyType="done"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={addCustomInterest}
              >
                <Plus size={18} color="#020617" />
              </Pressable>
            </View>

            {interests.length > 0 && (
              <>
                <Text style={styles.smallLabel}>Selected interests</Text>

                <View style={styles.grid}>
                  {interests.map(item => (
                    <SelectedTag
                      key={item}
                      label={item}
                      onRemove={() => removeInterest(item)}
                    />
                  ))}
                </View>
              </>
            )}
          </Section>

          <Section title="Optional eligibility">
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

            <View style={styles.infoMini}>
              <Target size={17} color="#67e8f9" />
              <Text style={styles.infoMiniText}>
                Optional fields help with scholarships and government benefits
                that have specific eligibility rules.
              </Text>
            </View>
          </Section>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              saving && styles.disabledButton
            ]}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Save size={18} color="#020617" />
                <Text style={styles.saveText}>Save Changes</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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

function SelectedTag({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.selectedTag}>
      <Text style={styles.selectedTagText}>{label}</Text>

      <Pressable onPress={onRemove} style={styles.removeTagButton}>
        <X size={13} color="#020617" />
      </Pressable>
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
  infoCard: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderColor: 'rgba(103,232,249,0.18)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 15,
    marginBottom: 16
  },
  infoText: {
    color: '#cbd5e1',
    lineHeight: 20,
    flex: 1,
    fontWeight: '700'
  },
  section: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 16
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 14
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderColor: 'rgba(255,255,255,0.14)',
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
  smallLabel: {
    color: '#94a3b8',
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 10,
    fontSize: 12,
    textTransform: 'uppercase'
  },
  customBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  customInput: {
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
  addButton: {
    width: 54,
    borderRadius: 18,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#67e8f9',
    borderRadius: 999,
    paddingVertical: 9,
    paddingLeft: 14,
    paddingRight: 8
  },
  selectedTagText: {
    color: '#020617',
    fontWeight: '900'
  },
  removeTagButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(2,6,23,0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoMini: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(103,232,249,0.07)',
    borderColor: 'rgba(103,232,249,0.16)',
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    marginTop: 4
  },
  infoMiniText: {
    color: '#cbd5e1',
    lineHeight: 20,
    flex: 1,
    fontWeight: '700'
  },
  saveButton: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    shadowColor: '#67e8f9',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  saveText: {
    color: '#020617',
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