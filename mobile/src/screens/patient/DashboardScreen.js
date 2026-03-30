import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { patientAPI, assessmentAPI } from '../../api/client';
import ScoreCard from '../../components/ScoreCard';
import RiskBadge from '../../components/RiskBadge';
import ChartCard from '../../components/ChartCard';
import BigButton from '../../components/BigButton';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    try {
      const [dbRes, histRes] = await Promise.all([
        patientAPI.getDashboard(),
        assessmentAPI.getHistory(7),
      ]);
      setData(dbRes.data);
      setHistory(histRes.data);
    } catch (error) {
      console.error('Error fetching dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return null;

  const latestScore = data?.latest_assessment?.overall_score || 0;
  const riskLevel = data?.risk_level || 'unknown';
  const streak = data?.streak || 0;

  const chartData = history.map(h => h.overall_score).reverse();
  const chartLabels = history.map(h => new Date(h.created_at).toLocaleDateString(undefined, { weekday: 'short' })).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.name}>{data?.fullName || 'Patient'}</Text>
        </View>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text style={styles.streakText}>{streak} Day Streak</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={[styles.mainCard, SHADOWS.medium]}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={styles.scoreRow}>
            <ScoreCard score={latestScore} label="Daily Index" size="medium" />
            <View style={styles.statusInfo}>
              <RiskBadge level={riskLevel} />
              <Text style={styles.statusDesc}>
                {riskLevel === 'low' ? 'Your cognitive levels look stable today.' : 
                 riskLevel === 'moderate' ? 'A slight deviation detected. Monitor rest.' : 
                 riskLevel === 'high' ? 'Significant change. Contact care provider.' :
                 'Complete your first assessment today.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsBox}>
          <BigButton
            title="Start Today's Assessment"
            onPress={() => navigation.navigate('Assessment')}
            iconName="mic-outline"
            variant="primary"
            style={styles.actionBtn}
          />
        </View>

        <ChartCard 
          title="Cognitive Performance (Last 7 Days)" 
          data={chartData} 
          labels={chartLabels}
          color={COLORS.primary} 
        />

        <View style={styles.recentGrid}>
          <View style={[styles.miniCard, SHADOWS.small]}>
            <View style={[styles.miniIcon, { backgroundColor: COLORS.accentGlow }]}>
              <Ionicons name="extension-puzzle" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.miniLabel}>Games</Text>
            <Text style={styles.miniVal}>{data?.latest_assessment?.games_score || 0}%</Text>
          </View>
          
          <View style={[styles.miniCard, SHADOWS.small]}>
            <View style={[styles.miniIcon, { backgroundColor: COLORS.primaryGlow }]}>
              <Ionicons name="mic" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.miniLabel}>Speech</Text>
            <Text style={styles.miniVal}>{data?.latest_assessment?.speech_score || 0}%</Text>
          </View>
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
  header: {
    padding: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcome: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: FONTS.sizeXL,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  streakText: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    color: '#F59E0B',
  },
  content: {
    padding: SPACING.md,
  },
  mainCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  statusInfo: {
    flex: 1,
    gap: SPACING.sm,
  },
  statusDesc: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '600',
  },
  actionsBox: {
    marginBottom: SPACING.md,
  },
  actionBtn: {
    height: 64,
  },
  recentGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  miniLabel: {
    fontSize: FONTS.sizeXS,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  miniVal: {
    fontSize: FONTS.sizeLG,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});
