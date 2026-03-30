import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';
import RiskBadge from '../../components/RiskBadge';
import BigButton from '../../components/BigButton';

export default function CaregiverDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await caregiverAPI.getPatients();
      setPatients(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Caregiver Portal</Text>
          <Text style={styles.title}>Supervised Patients</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, SHADOWS.small]}
          onPress={() => navigation.navigate('LinkPatient')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPatients(); }} />}
      >
        {patients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={[styles.patientCard, SHADOWS.medium]}
            onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id, patientName: patient.fullName })}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.patientName}>{patient.fullName}</Text>
                <Text style={styles.lastSeen}>Last Assessment: {patient.lastAssessmentDate || 'None today'}</Text>
              </View>
              <RiskBadge level={patient.currentRisk || 'unknown'} size="small" />
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.stat}>
                <Ionicons name="trending-up-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statLabel}>Score: {patient.currentScore || 0}%</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {patients.length === 0 && !loading && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>No patients linked yet</Text>
            <Text style={styles.emptySubtext}>Link a patient to start monitoring their cognitive health.</Text>
            <BigButton 
              title="Link First Patient" 
              onPress={() => navigation.navigate('LinkPatient')}
              iconName="link-outline"
              variant="outline"
              style={styles.emptyBtn}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcome: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md, // sharper: 8px
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  patientCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md, // sharper: 8px
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  info: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  lastSeen: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyBtn: {
    marginTop: SPACING.xl,
    width: '100%',
  },
});
