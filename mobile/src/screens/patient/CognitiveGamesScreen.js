import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const GAMES = [
  {
    id: 'memory',
    title: 'Memory Recall',
    desc: 'Repeat the items you saw earlier',
    icon: 'brain',
    color: '#003B95',
  },
  {
    id: 'pattern',
    title: 'Pattern Match',
    desc: 'Match visual sequences',
    icon: 'view-grid-outline',
    color: '#006B6B',
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    desc: 'Tap as fast as you can',
    icon: 'timer-outline',
    color: '#10B981',
  },
];

export default function CognitiveGamesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cognitive Hub</Text>
        <Text style={styles.subtitle}>Daily exercises to sharp your mind</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, SHADOWS.medium]}
            onPress={() => navigation.navigate('GamePlay', { gameId: game.id })}
            activeOpacity={0.9}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${game.color}15` }]}>
              <MaterialCommunityIcons name={game.icon} size={32} color={game.color} />
            </View>
            <View style={styles.info}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            These games help us measure your short-term memory and processing speed.
          </Text>
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
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md, // Sharper: 6px
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gameDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.lg,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '600',
  },
});
