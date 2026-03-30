import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import BigButton from '../../components/BigButton';

export default function CaregiverProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatarBox, SHADOWS.medium]}>
            <Ionicons name="people" size={50} color={COLORS.accent} />
          </View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Caregiver Portal</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={[styles.infoCard, SHADOWS.small]}>
            <TouchableOpacity style={styles.infoRow}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Alert Notifications</Text>
              <Text style={styles.infoVal}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Security & HIPAA</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow}>
              <Ionicons name="help-buoy-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <BigButton
          title="Sign Out"
          onPress={logout}
          variant="outline"
          iconName="log-out-outline"
          style={styles.logoutBtn}
        />

        <Text style={styles.versionHeader}>CogniScan v1.0.0 Stable</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md, // sharper: 8px
    backgroundColor: COLORS.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.accentGlow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    padding: SPACING.xl,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutBtn: {
    margin: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  versionHeader: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
