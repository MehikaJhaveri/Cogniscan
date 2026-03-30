import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export default function RiskBadge({ level, score, size = 'medium' }) {
  const config = {
    low: { color: COLORS.riskLow, label: 'LOW RISK', icon: 'checkmark-circle' },
    moderate: { color: COLORS.riskModerate, label: 'MODERATE RISK', icon: 'alert-circle' },
    high: { color: COLORS.riskHigh, label: 'HIGH RISK', icon: 'warning' },
    unknown: { color: COLORS.textMuted, label: 'NO DATA', icon: 'help-circle' },
  };

  const { color, label, icon } = config[level] || config.unknown;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15`, borderColor: color }]}>
      <Ionicons name={icon} size={isSmall ? 16 : 20} color={color} />
      <Text style={[styles.label, { color }, isSmall && styles.labelSmall]}>{label}</Text>
      {score !== undefined && score !== null && (
        <View style={[styles.scoreContainer, { backgroundColor: color }]}>
          <Text style={[styles.score, isSmall && styles.scoreSmall]}>
            {Math.round(score)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm, // Sharper: 4px
    borderWidth: 1.5,
    gap: SPACING.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FONTS.sizeSM,
    fontWeight: '800',
    letterSpacing: 1,
  },
  labelSmall: {
    fontSize: FONTS.sizeXS,
  },
  scoreContainer: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.xs, // Sharper: 2px
    marginLeft: 4,
  },
  score: {
    color: COLORS.white,
    fontSize: FONTS.sizeMD,
    fontWeight: '900',
  },
  scoreSmall: {
    fontSize: FONTS.sizeXS,
  },
});
