

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatients, getAppointments, getTreatments } from '../database/database';
import { User, Appointment, Treatment, Patient } from '../database/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Typage des props navigation (ajustez selon votre navigation)
type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    treatments: 0,
    todayAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      const user: User | null = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(user);

      const [patients, appointments, treatments]: [Patient[], Appointment[], Treatment[]] = await Promise.all([
        getPatients(),
        getAppointments(),
        getTreatments(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter((apt: Appointment) => apt.date === today);

      setStats({
        patients: patients.length,
        appointments: appointments.length,
        treatments: treatments.filter((t: Treatment) => t.status === 'actif').length,
        todayAppointments: todayAppointments.length,
      });

      // Récents rendez-vous (3 prochains)
      const upcomingAppointments = appointments
        .filter((apt: Appointment) => new Date(apt.date) >= new Date())
        .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      
      setRecentAppointments(upcomingAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('currentUser');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  type StatCardProps = {
    title: string;
    value: number;
    color: string;
    onPress?: () => void;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} disabled={!onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  type AppointmentCardProps = {
    appointment: Appointment;
  };

  const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentPatient}>{appointment.patientName}</Text>
        <Text style={styles.appointmentTime}>{appointment.time}</Text>
      </View>
      <Text style={styles.appointmentType}>{appointment.type}</Text>
      <Text style={styles.appointmentDate}>{appointment.date}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.userName}>{currentUser?.name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Patients"
            value={stats.patients}
            color="#10b981"
            onPress={() => navigation.navigate('Patients')}
          />
          <StatCard
            title="RDV Total"
            value={stats.appointments}
            color="#3b82f6"
            onPress={() => navigation.navigate('Appointments')}
          />
          <StatCard
            title="Traitements Actifs"
            value={stats.treatments}
            color="#f59e0b"
            onPress={() => navigation.navigate('Treatments')}
          />
          <StatCard
            title="RDV Aujourd'hui"
            value={stats.todayAppointments}
            color="#ef4444"
          />
        </View>
      </View>

      {/* Prochains rendez-vous */}
      <View style={styles.appointmentsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochains rendez-vous</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {recentAppointments.length > 0 ? (
          recentAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun rendez-vous à venir</Text>
          </View>
        )}
      </View>

      {/* Actions rapides */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Patients')}
          >
            <Text style={styles.quickActionText}>👥</Text>
            <Text style={styles.quickActionLabel}>Patients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={styles.quickActionText}>📅</Text>
            <Text style={styles.quickActionLabel}>Nouveau RDV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Treatments')}
          >
            <Text style={styles.quickActionText}>💊</Text>
            <Text style={styles.quickActionLabel}>Traitements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.quickActionText}>📋</Text>
            <Text style={styles.quickActionLabel}>Historique</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2563eb',
  },
  welcomeText: {
    color: '#e0e7ff',
    fontSize: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  appointmentsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  appointmentType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 16,
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickActionButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

export default DashboardScreen;