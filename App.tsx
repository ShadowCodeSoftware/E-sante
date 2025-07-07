import React, { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View, Text } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeDatabase } from './src/database/database';

// Import des écrans
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PatientsScreen from './src/screens/PatientsScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import TreatmentsScreen from './src/screens/TreatmentsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#2563eb",
      tabBarInactiveTintColor: "#6b7280",
      headerStyle: {
        backgroundColor: "#2563eb",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: "Tableau de bord",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
      }}
    />
    <Tab.Screen
      name="Patients"
      component={PatientsScreen}
      options={{
        title: "Patients",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
      }}
    />
    <Tab.Screen
      name="Appointments"
      component={AppointmentsScreen}
      options={{
        title: "Rendez-vous",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
      }}
    />
    <Tab.Screen
      name="Treatments"
      component={TreatmentsScreen}
      options={{
        title: "Traitements",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💊</Text>,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        title: "Historique",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: "Profil",
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
)

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Initialiser la base de données avec les données par défaut
      await initializeDatabase()
      // Vérifier si l'utilisateur est connecté
      const token = await AsyncStorage.getItem("userToken")
      setIsLoggedIn(!!token)
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
