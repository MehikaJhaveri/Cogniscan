import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../utils/theme';

import DashboardScreen from '../screens/patient/DashboardScreen';
import AssessmentScreen from '../screens/patient/AssessmentScreen';
import CognitiveGamesScreen from '../screens/patient/CognitiveGamesScreen';
import RecommendationsScreen from '../screens/patient/RecommendationsScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Assessment') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Games') {
            iconName = focused ? 'extension-puzzle' : 'extension-puzzle-outline';
          } else if (route.name === 'Tips') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Profile') {
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assessment" component={AssessmentScreen} />
      <Tab.Screen name="Games" component={CognitiveGamesScreen} />
      <Tab.Screen name="Tips" component={RecommendationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
