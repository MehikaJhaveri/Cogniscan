import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Patient
import BaselineSetupScreen from '../screens/patient/BaselineSetupScreen';
import PatientTabs from './PatientTabs';

// Caregiver
import CaregiverTabs from './CaregiverTabs';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function PatientStack() {
  const { user } = useAuth();
  const needsBaseline = user?.baselineCompleted === false;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsBaseline && (
        <Stack.Screen name="BaselineSetup" component={BaselineSetupScreen} />
      )}
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
    </Stack.Navigator>
  );
}

function CaregiverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CaregiverTabs" component={CaregiverTabs} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Starting CogniScan..." />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'caregiver' ? (
        <CaregiverStack />
      ) : (
        <PatientStack />
      )}
    </NavigationContainer>
  );
}
