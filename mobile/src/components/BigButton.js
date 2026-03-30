import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function BigButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  iconName,
  iconSource = 'Ionicons', // Ionicons or MaterialCommunityIcons
  style,
}) {
  const isOutline = variant === 'outline';

  const bgColor =
    variant === 'primary' ? COLORS.primary :
      variant === 'accent' ? COLORS.accent :
        variant === 'success' ? COLORS.success :
          variant === 'danger' ? COLORS.error :
            isOutline ? 'transparent' :
              COLORS.surfaceLight;

  const textColor = isOutline ? COLORS.primary : COLORS.white;
  const borderColor = isOutline ? COLORS.primary : 'transparent';

  const IconComponent = iconSource === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor },
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        SHADOWS.small,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <IconComponent
              name={iconName}
              size={20}
              color={textColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md, // Sharper edges (6px)
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  outline: {
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: FONTS.sizeMD,
    fontWeight: '700', // Bold
    letterSpacing: 0.5,
  },
});


// add this line
console.log("test change");