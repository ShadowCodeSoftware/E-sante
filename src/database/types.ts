export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'patient' | 'doctor';
  createdAt: string;
  avatar?: string;
  speciality?: string; // Pour les docteurs
  dateOfBirth?: string; // Pour les patients
  address?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory: string[];
  createdAt: string;
  doctorId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'actif' | 'terminé' | 'suspendu';
  startDate: string;
  endDate?: string;
  sideEffects?: string[];
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: 'consultation' | 'examination' | 'surgery' | 'test' | 'vaccination';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  attachments?: string[];
  createdAt: string;
}
