// export const initializeDatabase = async () => {
//   // Initialisation fictive de la base de données
//   return Promise.resolve();
// };



import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Patient, Appointment, Treatment } from './types';

// Données par défaut pour les tests
const defaultData = {

  
  users: [
    {
      id: '1',
      email: 'admin@esante.com',
      password: 'admin123',
      name: 'Dr. Martin Dubois',
      role: 'doctor',
      phone: '0123456789',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'user@esante.com',
      password: 'user123',
      name: 'Jean Dupont',
      role: 'patient',
      phone: '0987654321',
      createdAt: new Date().toISOString(),
    }
  ],
  patients: [
    {
      id: '1',
      name: 'Marie Durand',
      email: 'marie.durand@email.com',
      phone: '0123456789',
      dateOfBirth: '1985-03-15',
      address: '123 Rue de la Santé, Paris',
      bloodType: 'A+',
      allergies: 'Pénicilline',
      emergencyContact: 'Pierre Durand - 0987654321',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Paul Martin',
      email: 'paul.martin@email.com',
      phone: '0234567890',
      dateOfBirth: '1978-07-22',
      address: '456 Avenue de la Paix, Lyon',
      bloodType: 'O-',
      allergies: 'Aucune',
      emergencyContact: 'Sophie Martin - 0876543210',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Claire Rousseau',
      email: 'claire.rousseau@email.com',
      phone: '0345678901',
      dateOfBirth: '1992-11-08',
      address: '789 Boulevard du Bien-être, Marseille',
      bloodType: 'B+',
      allergies: 'Aspirine, Pollen',
      emergencyContact: 'Marc Rousseau - 0765432109',
      createdAt: new Date().toISOString(),
    }
  ],
  appointments: [
    {
      id: '1',
      patientId: '1',
      patientName: 'Marie Durand',
      doctorName: 'Dr. Martin Dubois',
      date: '2024-01-15',
      time: '09:00',
      type: 'Consultation générale',
      status: 'confirmé',
      notes: 'Contrôle de routine',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Paul Martin',
      doctorName: 'Dr. Martin Dubois',
      date: '2024-01-16',
      time: '14:30',
      type: 'Suivi cardiologique',
      status: 'en attente',
      notes: 'Suivi post-opératoire',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Claire Rousseau',
      doctorName: 'Dr. Martin Dubois',
      date: '2024-01-17',
      time: '11:15',
      type: 'Consultation dermatologique',
      status: 'confirmé',
      notes: 'Examen de grain de beauté',
      createdAt: new Date().toISOString(),
    }
  ],
  treatments: [
    {
      id: '1',
      patientId: '1',
      patientName: 'Marie Durand',
      medication: 'Paracétamol 500mg',
      dosage: '1 comprimé 3 fois par jour',
      duration: '7 jours',
      startDate: '2024-01-10',
      endDate: '2024-01-17',
      prescribedBy: 'Dr. Martin Dubois',
      instructions: 'À prendre après les repas',
      status: 'actif',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Paul Martin',
      medication: 'Lisinopril 10mg',
      dosage: '1 comprimé par jour',
      duration: '30 jours',
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      prescribedBy: 'Dr. Martin Dubois',
      instructions: 'À prendre le matin à jeun',
      status: 'actif',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      patientId: '1',
      patientName: 'Marie Durand',
      medication: 'Amoxicilline 1g',
      dosage: '1 comprimé 2 fois par jour',
      duration: '10 jours',
      startDate: '2023-12-15',
      endDate: '2023-12-25',
      prescribedBy: 'Dr. Martin Dubois',
      instructions: 'À prendre avec un grand verre d\'eau',
      status: 'terminé',
      createdAt: new Date('2023-12-15').toISOString(),
    }
  ]
};

export const initializeDatabase = async () => {
  try {
    // Vérifier si les données existent déjà
    const existingUsers = await AsyncStorage.getItem('users');
    
    if (!existingUsers) {
      // Initialiser avec les données par défaut
      await AsyncStorage.setItem('users', JSON.stringify(defaultData.users));
      await AsyncStorage.setItem('patients', JSON.stringify(defaultData.patients));
      await AsyncStorage.setItem('appointments', JSON.stringify(defaultData.appointments));
      await AsyncStorage.setItem('treatments', JSON.stringify(defaultData.treatments));
      
      console.log('Base de données initialisée avec les données par défaut');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

// Fonctions utilitaires pour la base de données
export const getUsers = async () => {
  try {
    const users = await AsyncStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};

export const getPatients = async () => {
  try {
    const patients = await AsyncStorage.getItem('patients');
    return patients ? JSON.parse(patients) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return [];
  }
};

export const getAppointments = async () => {
  try {
    const appointments = await AsyncStorage.getItem('appointments');
    return appointments ? JSON.parse(appointments) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return [];
  }
};

export const getTreatments = async () => {
  try {
    const treatments = await AsyncStorage.getItem('treatments');
    return treatments ? JSON.parse(treatments) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des traitements:', error);
    return [];
  }
};

export const saveData = async (key: string, data: any[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    return false;
  }
};

export const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient | null> => {
  try {
    const patients = await getPatients();
    const newPatient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    await saveData('patients', patients);
    return newPatient;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du patient:', error);
    return null;
  }
};

export const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment | null> => {
  try {
    const appointments = await getAppointments();
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    await saveData('appointments', appointments);
    return newAppointment;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du rendez-vous:', error);
    return null;
  }
};

export const addTreatment = async (treatment: Omit<Treatment, 'id' | 'createdAt'>): Promise<Treatment | null> => {
  try {
    const treatments = await getTreatments();
    const newTreatment = {
      ...treatment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    treatments.push(newTreatment);
    await saveData('treatments', treatments);
    return newTreatment;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du traitement:', error);
    return null;
  }
};