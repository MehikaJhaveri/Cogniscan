import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ChartCard({ title, data, labels, color = COLORS.primary, height = 180 }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No data yet</Text>
        </View>
      </View>
    );
  }

  const chartLabels = labels || data.map((_, i) => `D${i + 1}`);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels: chartLabels.slice(-7),
          datasets: [{ data: data.slice(-7).map(d => d || 0) }],
        }}
        width={SCREEN_WIDTH - 64}
        height={height}
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: COLORS.backgroundCard,
          backgroundGradientFrom: COLORS.backgroundCard,
          backgroundGradientTo: COLORS.backgroundCard,
          decimalCount: 0,
          color: (opacity = 1) => color,
          labelColor: () => COLORS.textSecondary,
          style: {
            borderRadius: RADIUS.sm,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '1',
            stroke: COLORS.backgroundCard,
          },
          propsForBackgroundLines: {
            stroke: COLORS.divider,
            strokeDasharray: '', // solid lines for a professional look
          },
        }}
        bezier
        withVerticalLines={false}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.sm, // Sharper edges: 4px
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  title: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chart: {
    marginVertical: 0,
    borderRadius: RADIUS.sm,
  },
  empty: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
  },
  emptyText: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
