import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';
import BigButton from '../../components/BigButton';

export default function LinkPatientScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (code.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit link code.');
      return;
    }
    setLoading(true);
    try {
      await caregiverAPI.linkPatient(code);
      Alert.alert('Success', 'Patient linked successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Linking Failed', e.response?.data?.detail || 'Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="link" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Link New Patient</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit secure link code found on your patient's profile to start monitoring.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Patient Link Code</Text>
          <View style={[styles.codeContainer, SHADOWS.small]}>
            <TextInput
              style={styles.input}
              placeholder="000 000"
              placeholderTextColor={COLORS.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              This code ensures a secure medical-grade connection between your devices.
            </Text>
          </View>

          <BigButton
            title="Securely Link Patient"
            onPress={handleLink}
            loading={loading}
            iconName="shield-checkmark-outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md, // sharper: 8px
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
    fontWeight: '600',
  },
  form: {
    marginTop: SPACING.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  codeContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  input: {
    height: 72,
    fontSize: 40,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 8,
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  button: {
    height: 64,
  },
});
