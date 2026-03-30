import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function AlertCard({ alert, onMarkRead }) {
  const isPriorityHigh = alert.severity === 'high';
  const isPriorityMed = alert.severity === 'medium';
  
  const accentColor = 
    isPriorityHigh ? COLORS.error : 
    isPriorityMed ? COLORS.warning : 
    COLORS.success;

  const iconName = 
    isPriorityHigh ? 'alert-circle' : 
    isPriorityMed ? 'notifications' : 
    'checkmark-circle';

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }, alert.is_read && styles.readCard]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
          <Ionicons name={iconName} size={24} color={accentColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.date}>{new Date(alert.created_at).toLocaleDateString()}</Text>
        </View>
        {!alert.is_read && (
          <TouchableOpacity 
            style={styles.markReadBtn} 
            onPress={() => onMarkRead(alert.id)}
          >
            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.message}>{alert.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.sm, // Sharper: 4px
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  readCard: {
    opacity: 0.7,
    borderLeftColor: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.sizeMD,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: FONTS.sizeXS,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  message: {
    fontSize: FONTS.sizeSM,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: 0,
  },
  markReadBtn: {
    padding: SPACING.sm,
  },
});
