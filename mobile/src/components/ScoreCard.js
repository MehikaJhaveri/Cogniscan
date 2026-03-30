import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';

export default function ScoreCard({ label, score, maxScore = 100, color, size = 'medium' }) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const displayColor = color || (score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.error);
  
  const circleSize = size === 'small' ? 80 : size === 'large' ? 140 : 110;
  const fontSize = size === 'small' ? FONTS.sizeLG : size === 'large' ? FONTS.sizeHero : FONTS.sizeXL;
  const labelSize = size === 'small' ? FONTS.sizeXS : FONTS.sizeSM;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: COLORS.divider,
            backgroundColor: COLORS.surfaceLight,
          },
        ]}
      >
        <View 
          style={[
            styles.fill, 
            { 
              backgroundColor: displayColor, 
              height: `${percentage}%`,
              opacity: 0.1,
              width: '100%',
              position: 'absolute',
              bottom: 0,
            }
          ]} 
        />
        <Text style={[styles.score, { fontSize, color: displayColor }]}>
          {Math.round(score)}
        </Text>
      </View>
      {label && <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  circle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fill: {
    // Fill effect to match high-tech look
  },
  score: {
    fontWeight: '900',
    zIndex: 2,
  },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
