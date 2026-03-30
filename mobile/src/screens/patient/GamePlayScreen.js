import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { assessmentAPI } from '../../api/client';
import BigButton from '../../components/BigButton';

export default function GamePlayScreen({ route, navigation }) {
  const { gameId } = route.params;
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('ready'); // ready, playing, finished
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const startPlaying = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishGame = async () => {
    clearInterval(timerRef.current);
    setGameState('finished');
    try {
      await assessmentAPI.submitCognitive({ game: gameId, score: score });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTap = () => {
    if (gameState === 'playing') setScore(s => s + 10);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{gameId.replace(/^\w/, (c) => c.toUpperCase())} Game</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {gameState === 'ready' && (
          <View style={styles.centerBox}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons 
                name={gameId === 'reaction' ? 'timer-flash' : 'brain'} 
                size={64} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.instruction}>
              {gameId === 'reaction' ? 'Tap the screen as many times as you can!' : 'Follow the patterns on the screen.'}
            </Text>
            <BigButton title="I'm Ready" onPress={startPlaying} />
          </View>
        )}

        {gameState === 'playing' && (
          <View style={styles.gameArea}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statVal}>{score}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={[styles.statVal, timeLeft < 10 && { color: COLORS.error }]}>{timeLeft}s</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleTap}
              activeOpacity={0.8}
              style={[styles.playTarget, SHADOWS.large]}
            >
              <MaterialCommunityIcons name="target" size={100} color={COLORS.white} />
              <Text style={styles.targetText}>TAP!</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'finished' && (
          <View style={styles.centerBox}>
            <Ionicons name="trophy" size={80} color={COLORS.warning} />
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.finishedText}>Great job! Your levels look good.</Text>
            <BigButton 
              title="Continue" 
              onPress={() => navigation.goBack()} 
              variant="accent"
              style={{ width: '100%' }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  body: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  instruction: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  playTarget: {
    width: 240,
    height: 240,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, // sharper corners (10px)
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  targetText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  finalScore: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  finishedText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
});
