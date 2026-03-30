import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { patientAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import BigButton from '../../components/BigButton';

export default function BaselineSetupScreen({ navigation }) {
  const { checkAuth } = useAuth();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!age || !gender || !interests) {
      Alert.alert('Incomplete Profile', 'Please fill in your basic details to continue.');
      return;
    }

    setLoading(true);
    try {
      await patientAPI.updateProfile({
        age: parseInt(age),
        gender,
        medical_history: medicalHistory,
        interests: interests.split(',').map((s) => s.trim()),
        baseline_completed: true,
      });
      await checkAuth(); // Refresh user state to navigation to Dashboard
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="clipboard-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Baseline Profile</Text>
            <Text style={styles.subtitle}>
              This information helps us personalize your cognitive health journey.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Years"
                placeholderTextColor={COLORS.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                placeholder="Male, Female, Other"
                placeholderTextColor={COLORS.textMuted}
                value={gender}
                onChangeText={setGender}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Medical History (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Hypertension, Diabetes, etc."
                placeholderTextColor={COLORS.textMuted}
                value={medicalHistory}
                onChangeText={setMedicalHistory}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Topics of Interest</Text>
              <Text style={styles.helpText}>Separated by commas (e.g. History, Gardening)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Movies, Nature, Science..."
                placeholderTextColor={COLORS.textMuted}
                value={interests}
                onChangeText={setInterests}
                multiline
                numberOfLines={2}
              />
            </View>

            <BigButton
              title="Complete Setup"
              onPress={handleSubmit}
              loading={loading}
              iconName="check-badge-outline"
              iconSource="MaterialCommunityIcons"
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md, // Sharper: 6px
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONTS.sizeMD,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    fontWeight: '600',
  },
  form: {
    marginTop: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: FONTS.sizeXS,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm, // Sharper: 4px
    paddingHorizontal: SPACING.md,
    height: 52,
    fontSize: FONTS.sizeMD,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  textArea: {
    height: 80,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: SPACING.lg,
  },
});
