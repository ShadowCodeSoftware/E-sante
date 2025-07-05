// Types pour la base de données

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  duration: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  instructions: string;
  status: string;
  createdAt: string;
}
