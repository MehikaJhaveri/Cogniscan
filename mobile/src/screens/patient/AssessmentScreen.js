import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { assessmentAPI } from '../../api/client';
import BigButton from '../../components/BigButton';

export default function AssessmentScreen({ navigation }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [question, setQuestion] = useState('Tell me about your favorite childhood memory.');
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      setHasAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'assessment.m4a',
      });

      // Navigate to Game hub while processing
      navigation.navigate('Games');
      await assessmentAPI.upload(formData);
    } catch (err) {
      console.error('Stop error', err);
    }
  };

  if (hasCameraPermission === null || hasAudioPermission === null) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.brandName}>CogniScan</Text>
            <Text style={styles.assistantText}>Assistant: Alex</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.promptSection}>
          <Text style={styles.promptTitle}>{question}</Text>
          <Text style={styles.promptSubtitle}>Look at the screen and speak naturally.</Text>
        </View>

        <View style={[styles.cameraContainer, SHADOWS.medium]}>
          <Camera style={styles.camera} type={Camera.Constants.Type.front}>
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraLabel}>
                <View style={[styles.dot, { backgroundColor: isRecording ? COLORS.error : COLORS.success }]} />
                <Text style={styles.cameraLabelText}>CAMERA ON</Text>
              </View>
            </View>
          </Camera>
        </View>

        <View style={[styles.visualizerBox, SHADOWS.small]}>
          <MaterialCommunityIcons name="waveform" size={48} color={COLORS.primary} />
          <View style={styles.waveformPlaceholder}>
            {[1, 2, 3, 4, 5, 2, 4, 6, 4, 3, 5, 2].map((h, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveBar, 
                  { height: h * 6, backgroundColor: isRecording ? COLORS.primary : COLORS.border }
                ]} 
              />
            ))}
          </View>
        </View>

        <View style={[styles.analysisCard, SHADOWS.small]}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>LIVE ANALYSIS</Text>
            <View style={[styles.dot, { backgroundColor: isRecording ? COLORS.error : COLORS.textMuted }]} />
          </View>
          
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Speech Progress</Text>
            <Text style={styles.progressTime}>00:{timer < 10 ? `0${timer}` : timer} / 01:00</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(timer / 60) * 100}%` }]} />
          </View>

          <View style={styles.facialStatus}>
            <Ionicons name="happy-outline" size={18} color={COLORS.accent} />
            <Text style={styles.facialText}>Facial tracking active</Text>
          </View>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "Alex is listening for tone, clarity, and expression to help monitor your cognitive health."
          </Text>
        </View>

        <BigButton
          title={isRecording ? 'Stop Assessment' : 'Start Talking'}
          onPress={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'danger' : 'primary'}
          iconName={isRecording ? 'stop-circle-outline' : 'mic-outline'}
          style={styles.actionBtn}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md, // Sharper: 6px
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  assistantText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  scroll: {
    padding: SPACING.lg,
  },
  promptSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  promptTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: SPACING.md,
  },
  promptSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  cameraContainer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  cameraLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    gap: 6,
  },
  cameraLabelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visualizerBox: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    height: 100,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  waveformPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  analysisCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  analysisTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  progressTime: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  facialStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facialText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '750',
  },
  quoteBox: {
    backgroundColor: '#EEF2FF', // Soft indigo tint
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xl,
  },
  quoteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  actionBtn: {
    marginBottom: SPACING.xxl,
    height: 64,
  },
});
