import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../utils/theme';

import CaregiverDashboard from '../screens/caregiver/CaregiverDashboard';
import AlertsScreen from '../screens/caregiver/AlertsScreen';
import CaregiverProfileScreen from '../screens/caregiver/CaregiverProfileScreen';
import PatientDetailScreen from '../screens/caregiver/PatientDetailScreen';
import LinkPatientScreen from '../screens/caregiver/LinkPatientScreen';
import InsightsScreen from '../screens/caregiver/InsightsScreen';
import CaregiverRecommendationsScreen from '../screens/caregiver/CaregiverRecommendationsScreen';

const Tab = createBottomTabNavigator();
const PatientsStack = createNativeStackNavigator();

function PatientsStackScreen() {
  return (
    <PatientsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.backgroundCard },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <PatientsStack.Screen
        name="CaregiverDashboard"
        component={CaregiverDashboard}
        options={{ title: 'My Patients' }}
      />
      <PatientsStack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient Health' }}
      />
      <PatientsStack.Screen
        name="LinkPatient"
        component={LinkPatientScreen}
        options={{ title: 'Add Patient' }}
      />
      <PatientsStack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'AI Insights' }}
      />
      <PatientsStack.Screen
        name="CaregiverRecommendations"
        component={CaregiverRecommendationsScreen}
        options={{ title: 'Next Steps' }}
      />
    </PatientsStack.Navigator>
  );
}

export default function CaregiverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'CaregiverProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.backgroundCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
          elevation: 0,
        },
      })}
    >
      <Tab.Screen
        name="Patients"
        component={PatientsStackScreen}
        options={{ tabBarLabel: 'Patients' }}
      />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen
        name="CaregiverProfile"
        component={CaregiverProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
