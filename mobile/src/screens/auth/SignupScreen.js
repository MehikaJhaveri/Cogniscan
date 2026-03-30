import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import BigButton from '../../components/BigButton';

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;
  const { signup } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signup(fullName, email, password, role);
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = role === 'patient' ? COLORS.primary : COLORS.accent;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {role === 'patient' ? 'Patient Enrollment' : 'Caregiver Enrollment'}
            </Text>
            <Text style={styles.subtitle}>Join the CogniScan community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <BigButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              iconName="person-add-outline"
              variant={role === 'patient' ? 'primary' : 'accent'}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already registered? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
                <Text style={[styles.signupText, { color: accentColor }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 0,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONTS.sizeMD,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: FONTS.sizeMD,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  button: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizeMD,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  signupText: {
    fontSize: FONTS.sizeMD,
    fontWeight: '800',
  },
});
