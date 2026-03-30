import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { patientAPI } from '../../api/client';

export default function RecommendationsScreen() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await patientAPI.getRecommendations();
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
      <View style={styles.header}>
        <Text style={styles.title}>Health Tips</Text>
        <Text style={styles.subtitle}>AI-generated insights for your wellbeing</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {recommendations.map((tip, index) => (
          <View key={index} style={[styles.tipCard, SHADOWS.small]}>
            <View style={styles.tipHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryGlow }]}>
                <Ionicons name="medical" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.tipTitle}>{tip.category || 'Health Tip'}</Text>
            </View>
            <Text style={styles.tipBody}>{tip.content}</Text>
            <View style={styles.tipFooter}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.tipDate}>Just added</Text>
            </View>
          </View>
        ))}

        {recommendations.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="bulb-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Complete assessment to see tips</Text>
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
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    padding: SPACING.md,
  },
  tipCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md, // sharper: 6px
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
    fontSize: FONTS.sizeMD,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '600',
  },
  tipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  tipDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
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
