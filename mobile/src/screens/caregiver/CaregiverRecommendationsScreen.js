import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';

export default function CaregiverRecommendationsScreen({ route }) {
  const { patientId } = route.params;
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await caregiverAPI.getPatientRecommendations(patientId);
      setRecommendations(res.data);
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
          <Text style={styles.title}>Caregiver Guidance</Text>
          <Text style={styles.subtitle}>Personalized steps to support your patient</Text>
        </View>

        {recommendations.map((tip, index) => (
          <View key={index} style={[styles.tipCard, SHADOWS.small]}>
            <View style={styles.tipHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.accentGlow }]}>
                <Ionicons name="medical-outline" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.tipTitle}>{tip.category || 'Care Tip'}</Text>
            </View>
            <Text style={styles.tipBody}>{tip.content}</Text>
          </View>
        ))}

        {recommendations.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="happy-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No immediate actions required</Text>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    padding: SPACING.md,
  },
  tipCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
