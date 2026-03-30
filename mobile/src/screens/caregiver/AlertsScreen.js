import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';
import { caregiverAPI } from '../../api/client';
import AlertCard from '../../components/AlertCard';

export default function AlertsScreen({ route }) {
  const patientId = route.params?.patientId;
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = patientId 
        ? await caregiverAPI.getPatientAlerts(patientId)
        : await caregiverAPI.getAllAlerts();
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (alertId) => {
    try {
      await caregiverAPI.markAlertRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!patientId && (
        <View style={styles.globalHeader}>
          <Ionicons name="notifications" size={28} color={COLORS.primary} />
          <Text style={styles.title}>System Alerts</Text>
        </View>
      )}

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertCard alert={item} onMarkRead={markAsRead} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>All clear!</Text>
            <Text style={styles.emptySubtext}>There are no pending alerts for your patients.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  globalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  list: {
    padding: SPACING.md,
  },
  empty: {
    paddingVertical: 120,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '600',
  },
});
