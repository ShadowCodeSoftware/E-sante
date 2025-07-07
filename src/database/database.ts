import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Patient, Appointment, Treatment, MedicalRecord } from './types';

// Données prédéfinies
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Marie Dubois',
    email: 'admin@esante.com',
    password: 'admin123',
    phone: '+33123456789',
    role: 'doctor',
    speciality: 'Médecine Générale',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'user@esante.com',
    password: 'user123',
    phone: '+33987654321',
    role: 'patient',
    dateOfBirth: '1985-05-15',
    address: '123 Rue de la Santé, Paris',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Dr. Pierre Leroy',
    email: 'doctor2@esante.com',
    password: 'doctor123',
    phone: '+33456789123',
    role: 'doctor',
    speciality: 'Cardiologie',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];

const defaultPatients: Patient[] = [
  {
    id: '1',
    name: 'Jean Martin',
    email: 'user@esante.com',
    phone: '+33987654321',
    dateOfBirth: '1985-05-15',
    address: '123 Rue de la Santé, Paris',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Arachides'],
    emergencyContact: {
      name: 'Marie Martin',
      phone: '+33123987456',
      relation: 'Épouse',
    },
    medicalHistory: ['Hypertension', 'Diabète type 2'],
    createdAt: '2024-01-02T00:00:00.000Z',
    doctorId: '1',
  },
  {
    id: '2',
    name: 'Sophie Durand',
    email: 'sophie@email.com',
    phone: '+33654321987',
    dateOfBirth: '1990-08-22',
    address: '456 Avenue de la République, Lyon',
    bloodType: 'O-',
    allergies: ['Latex'],
    emergencyContact: {
      name: 'Paul Durand',
      phone: '+33789456123',
      relation: 'Père',
    },
    medicalHistory: ['Asthme'],
    createdAt: '2024-01-04T00:00:00.000Z',
    doctorId: '1',
  },
  {
    id: '3',
    name: 'Michel Rousseau',
    email: 'michel@email.com',
    phone: '+33321654987',
    dateOfBirth: '1975-12-10',
    address: '789 Boulevard Saint-Germain, Marseille',
    bloodType: 'B+',
    allergies: [],
    emergencyContact: {
      name: 'Claire Rousseau',
      phone: '+33147258369',
      relation: 'Épouse',
    },
    medicalHistory: ['Cholestérol élevé'],
    createdAt: '2024-01-05T00:00:00.000Z',
    doctorId: '3',
  },
];

const defaultAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Jean Martin',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    date: '2024-07-08',
    time: '09:00',
    type: 'Consultation générale',
    status: 'scheduled',
    symptoms: 'Fatigue, maux de tête',
    createdAt: '2024-07-04T00:00:00.000Z',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sophie Durand',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    date: '2024-07-08',
    time: '10:30',
    type: 'Suivi asthme',
    status: 'scheduled',
    symptoms: 'Essoufflement',
    createdAt: '2024-07-04T00:00:00.000Z',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michel Rousseau',
    doctorId: '3',
    doctorName: 'Dr. Pierre Leroy',
    date: '2024-07-09',
    time: '14:00',
    type: 'Consultation cardiologique',
    status: 'scheduled',
    symptoms: 'Douleurs thoraciques',
    createdAt: '2024-07-04T00:00:00.000Z',
  },
  {
    id: '4',
    patientId: '1',
    patientName: 'Jean Martin',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    date: '2024-07-01',
    time: '15:00',
    type: 'Bilan sanguin',
    status: 'completed',
    diagnosis: 'Diabète sous contrôle',
    notes: 'Résultats satisfaisants',
    createdAt: '2024-06-28T00:00:00.000Z',
  },
];

const defaultTreatments: Treatment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Jean Martin',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    medication: 'Metformine',
    dosage: '500mg',
    frequency: '2 fois par jour',
    duration: '3 mois',
    instructions: 'À prendre avec les repas',
    status: 'actif',
    startDate: '2024-06-01',
    endDate: '2024-09-01',
    createdAt: '2024-06-01T00:00:00.000Z',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sophie Durand',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    medication: 'Ventoline',
    dosage: '100mcg',
    frequency: 'Au besoin',
    duration: 'Permanent',
    instructions: '2 bouffées en cas de crise',
    status: 'actif',
    startDate: '2024-01-15',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michel Rousseau',
    doctorId: '3',
    doctorName: 'Dr. Pierre Leroy',
    medication: 'Atorvastatine',
    dosage: '20mg',
    frequency: '1 fois par jour',
    duration: '6 mois',
    instructions: 'Le soir, avec un verre d\'eau',
    status: 'actif',
    startDate: '2024-05-01',
    endDate: '2024-11-01',
    createdAt: '2024-05-01T00:00:00.000Z',
  },
];

const defaultMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Jean Martin',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    date: '2024-07-01',
    type: 'test',
    title: 'Bilan sanguin complet',
    description: 'Analyse de routine pour suivi diabète',
    diagnosis: 'Glycémie stable, HbA1c à 7.2%',
    treatment: 'Continuer Metformine',
    createdAt: '2024-07-01T00:00:00.000Z',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sophie Durand',
    doctorId: '1',
    doctorName: 'Dr. Marie Dubois',
    date: '2024-06-15',
    type: 'consultation',
    title: 'Consultation asthme',
    description: 'Suivi régulier de l\'asthme',
    diagnosis: 'Asthme bien contrôlé',
    treatment: 'Continuer traitement actuel',
    createdAt: '2024-06-15T00:00:00.000Z',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michel Rousseau',
    doctorId: '3',
    doctorName: 'Dr. Pierre Leroy',
    date: '2024-05-01',
    type: 'examination',
    title: 'ECG et échographie cardiaque',
    description: 'Examen cardiologique complet',
    diagnosis: 'Fonction cardiaque normale',
    treatment: 'Statines pour cholestérol',
    createdAt: '2024-05-01T00:00:00.000Z',
  },
];

// Fonctions de base de données
export const initializeDatabase = async (): Promise<void> => {
  try {
    const existingUsers = await AsyncStorage.getItem('users');
    if (!existingUsers) {
      await AsyncStorage.setItem('users', JSON.stringify(defaultUsers));
      await AsyncStorage.setItem('patients', JSON.stringify(defaultPatients));
      await AsyncStorage.setItem('appointments', JSON.stringify(defaultAppointments));
      await AsyncStorage.setItem('treatments', JSON.stringify(defaultTreatments));
      await AsyncStorage.setItem('medicalRecords', JSON.stringify(defaultMedicalRecords));
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    throw error;
  }
};

export const getData = async (key: string): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key}:`, error);
    return [];
  }
};

// Fonctions spécifiques
export const getUsers = async (): Promise<User[]> => {
  return await getData('users');
};

export const getPatients = async (): Promise<Patient[]> => {
  return await getData('patients');
};

export const getAppointments = async (): Promise<Appointment[]> => {
  return await getData('appointments');
};

export const getTreatments = async (): Promise<Treatment[]> => {
  return await getData('treatments');
};

export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  return await getData('medicalRecords');
};

// Fonctions d'ajout
export const addPatient = async (patient: Patient): Promise<void> => {
  const patients = await getPatients();
  patients.push(patient);
  await saveData('patients', patients);
};

export const addAppointment = async (appointment: Appointment): Promise<void> => {
  const appointments = await getAppointments();
  appointments.push(appointment);
  await saveData('appointments', appointments);
};

export const addTreatment = async (treatment: Treatment): Promise<void> => {
  const treatments = await getTreatments();
  treatments.push(treatment);
  await saveData('treatments', treatments);
};

export const addMedicalRecord = async (record: MedicalRecord): Promise<void> => {
  const records = await getMedicalRecords();
  records.push(record);
  await saveData('medicalRecords', records);
};

// Fonctions de mise à jour
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  const appointments = await getAppointments();
  const index = appointments.findIndex((apt: Appointment) => apt.id === appointmentId);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    await saveData('appointments', appointments);
  }
};

export const updateTreatment = async (treatmentId: string, updates: Partial<Treatment>): Promise<void> => {
  const treatments = await getTreatments();
  const index = treatments.findIndex((treatment: Treatment) => treatment.id === treatmentId);
  if (index !== -1) {
    treatments[index] = { ...treatments[index], ...updates };
    await saveData('treatments', treatments);
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<void> => {
  const patients = await getPatients();
  const index = patients.findIndex((patient: Patient) => patient.id === patientId);
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updates };
    await saveData('patients', patients);
  }
};
