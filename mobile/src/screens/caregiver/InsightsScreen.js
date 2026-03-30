import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';

export default function InsightsScreen({ route }) {
  const { patientId } = route.params;
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await caregiverAPI.getPatientInsights(patientId);
      setInsights(res.data);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.header}>
          <Ionicons name="analytics" size={32} color={COLORS.primary} />
          <Text style={styles.title}>AI Trends & Insights</Text>
          <Text style={styles.subtitle}>Automated analysis of cognitive indicators</Text>
        </View>

        {insights.map((insight, index) => (
          <View key={index} style={[styles.insightCard, SHADOWS.small]}>
            <View style={styles.insightHeader}>
              <View style={[styles.badge, insight.type === 'warning' ? styles.warning : styles.info]}>
                <Ionicons 
                  name={insight.type === 'warning' ? 'warning' : 'information-circle'} 
                  size={14} 
                  color={COLORS.white} 
                />
                <Text style={styles.badgeText}>{insight.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.insightDate}>Latest Analysis</Text>
            </View>
            <Text style={styles.insightText}>{insight.content}</Text>
          </View>
        ))}

        {insights.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Processing active analysis...</Text>
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
  content: {
    padding: SPACING.md,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  warning: { backgroundColor: COLORS.error },
  info: { backgroundColor: COLORS.primary },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  insightDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
