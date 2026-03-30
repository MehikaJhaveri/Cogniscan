import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../api/client';
import BigButton from '../../components/BigButton';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientAPI.getProfile();
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatarBox, SHADOWS.medium]}>
            <Ionicons name="person" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Patient Profile</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync with Caregiver</Text>
          <View style={[styles.linkBox, SHADOWS.small]}>
            <View style={styles.linkHeader}>
              <Ionicons name="link-outline" size={24} color={COLORS.primary} />
              <Text style={styles.linkLabel}>Your Patient Link Code</Text>
            </View>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{profile?.link_code || '--- ---'}</Text>
            </View>
            <Text style={styles.linkDesc}>
              Give this code to your caregiver to share your health updates securely.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={[styles.infoCard, SHADOWS.small]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoVal}>{profile?.age || '-'} Years</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="transgender-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoVal}>{profile?.gender || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="heart-half-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Interests</Text>
              <Text style={styles.infoVal}>{profile?.interests?.join(', ') || '-'}</Text>
            </View>
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
    backgroundColor: COLORS.surfaceLight,
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
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
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
  linkBox: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  codeContainer: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    color: COLORS.textPrimary,
  },
  linkDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    color: COLORS.textPrimary,
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
