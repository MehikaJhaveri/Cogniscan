import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';
import ScoreCard from '../../components/ScoreCard';
import RiskBadge from '../../components/RiskBadge';
import ChartCard from '../../components/ChartCard';
import BigButton from '../../components/BigButton';

export default function PatientDetailScreen({ route, navigation }) {
  const { patientId, patientName } = route.params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await caregiverAPI.getPatientDashboard(patientId);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.patientProfile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{patientName}</Text>
          <RiskBadge level={data?.risk_level || 'unknown'} />
        </View>

        <View style={styles.statsRow}>
          <ScoreCard score={data?.latest_assessment?.overall_score || 0} label="Current Score" size="small" />
          <View style={styles.statInfo}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DAILY STREAK</Text>
              <Text style={styles.statValue}>{data?.streak || 0} Days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>LAST ANALYSIS</Text>
              <Text style={styles.statValue}>{data?.latest_assessment?.created_at ? new Date(data.latest_assessment.created_at).toLocaleDateString() : 'Never'}</Text>
            </View>
          </View>
        </View>

        <ChartCard 
          title="Performance Trend" 
          data={data?.history?.map(h => h.overall_score).reverse() || []}
          labels={data?.history?.map(h => new Date(h.created_at).toLocaleDateString(undefined, { weekday: 'short' })).reverse() || []}
        />

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, SHADOWS.small]}
            onPress={() => navigation.navigate('Alerts', { patientId })}
          >
            <Ionicons name="notifications-outline" size={28} color={COLORS.error} />
            <Text style={styles.actionLabel}>Priority Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, SHADOWS.small]}
            onPress={() => navigation.navigate('Insights', { patientId })}
          >
            <Ionicons name="analytics-outline" size={28} color={COLORS.primary} />
            <Text style={styles.actionLabel}>AI Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, SHADOWS.small]}
            onPress={() => navigation.navigate('CaregiverRecommendations', { patientId })}
          >
            <Ionicons name="bulb-outline" size={28} color={COLORS.accent} />
            <Text style={styles.actionLabel}>Next Steps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSummary}>
          <Text style={styles.summaryTitle}>MEDICAL HISTORY</Text>
          <Text style={styles.summaryText}>{data?.medical_history || 'No medical history provided.'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  patientProfile: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.xl,
    borderRadius: RADIUS.md, // sharper: 8px
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderColor: COLORS.divider,
    borderWidth: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.xl,
  },
  statInfo: {
    flex: 1,
    gap: SPACING.md,
  },
  statBox: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  infoSummary: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 1.2,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '600',
  },
});
