import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import BigButton from '../../components/BigButton';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="scan-circle" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>CogniScan</Text>
          <Text style={styles.subtitle}>AI-Powered Cognitive Health Monitoring</Text>
        </View>

        <View style={styles.cardsContainer}>
          <Text style={styles.selectionTitle}>Choose your role to get started</Text>
          
          <TouchableOpacity 
            style={[styles.roleCard, SHADOWS.medium]}
            onPress={() => navigation.navigate('Login', { role: 'patient' })}
            activeOpacity={0.9}
          >
            <View style={[styles.roleIcon, { backgroundColor: COLORS.primaryGlow }]}>
              <Ionicons name="person" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Patient</Text>
              <Text style={styles.roleDesc}>Monitor your health daily</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, SHADOWS.medium]}
            onPress={() => navigation.navigate('Login', { role: 'caregiver' })}
            activeOpacity={0.9}
          >
            <View style={[styles.roleIcon, { backgroundColor: COLORS.accentGlow }]}>
              <Ionicons name="people" size={32} color={COLORS.accent} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Caregiver</Text>
              <Text style={styles.roleDesc}>Support your loved ones</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Secure & Private • HIPAA Compliant
        </Text>
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
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONTS.sizeMD,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  cardsContainer: {
    width: '100%',
  },
  selectionTitle: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: RADIUS.md, // Sharper: 6px
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: FONTS.sizeXXL,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roleDesc: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    fontSize: FONTS.sizeXS,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
