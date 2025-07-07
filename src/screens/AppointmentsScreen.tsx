import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getAppointments, getPatients, addAppointment, updateAppointment } from '../database/database';
import { Appointment, Patient } from '../database/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AppointmentsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: '',
    symptoms: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, appointments, selectedFilter]);

  const loadData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        getAppointments(),
        getPatients(),
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut/date
    const today = new Date().toISOString().split('T')[0];
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(apt => apt.date === today);
        break;
      case 'upcoming':
        filtered = filtered.filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled');
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
    }

    // Trier par date et heure
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      date: '',
      time: '',
      type: '',
      symptoms: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      symptoms: appointment.symptoms || '',
      notes: appointment.notes || '',
    });
    setModalVisible(true);
  };

  const handleSaveAppointment = async () => {
    if (!formData.patientId || !formData.date || !formData.time || !formData.type) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      if (!selectedPatient) {
        Alert.alert('Erreur', 'Patient non trouvé');
        return;
      }

      const appointmentData: Appointment = {
        id: editingAppointment?.id || Date.now().toString(),
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        doctorId: '1', // À adapter selon l'utilisateur connecté
        doctorName: 'Dr. Marie Dubois', // À adapter selon l'utilisateur connecté
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: editingAppointment?.status || 'scheduled',
        symptoms: formData.symptoms,
        notes: formData.notes,
        createdAt: editingAppointment?.createdAt || new Date().toISOString(),
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await addAppointment(appointmentData);
      }

      setModalVisible(false);
      await loadData();
      Alert.alert('Succès', `Rendez-vous ${editingAppointment ? 'modifié' : 'ajouté'} avec succès`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le rendez-vous');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointment(appointmentId, { status });
      await loadData();
      Alert.alert('Succès', 'Statut mis à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'no-show': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'no-show': return 'Absent';
      default: return status;
    }
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <TouchableOpacity style={styles.appointmentCard} onPress={() => openEditModal(appointment)}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentPatient}>{appointment.patientName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.appointmentType}>{appointment.type}</Text>
      <Text style={styles.appointmentDateTime}>
        📅 {appointment.date} à {appointment.time}
      </Text>
      
      {appointment.symptoms && (
        <Text style={styles.appointmentSymptoms}>
          Symptômes: {appointment.symptoms}
        </Text>
      )}
      
      {appointment.notes && (
        <Text style={styles.appointmentNotes}>
          Notes: {appointment.notes}
        </Text>
      )}

      {appointment.status === 'scheduled' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => updateAppointmentStatus(appointment.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Terminer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => updateAppointmentStatus(appointment.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterButton: React.FC<{ 
    filter: typeof selectedFilter; 
    title: string; 
    count: number 
  }> = ({ filter, title, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  const getFilterCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      all: appointments.length,
      today: appointments.filter(apt => apt.date === today).length,
      upcoming: appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
    };
  };

  const filterCounts = getFilterCounts();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un rendez-vous..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <FilterButton filter="all" title="Tous" count={filterCounts.all} />
        <FilterButton filter="today" title="Aujourd'hui" count={filterCounts.today} />
        <FilterButton filter="upcoming" title="À venir" count={filterCounts.upcoming} />
        <FilterButton filter="completed" title="Terminés" count={filterCounts.completed} />
      </ScrollView>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun rendez-vous trouvé</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAppointment ? 'Modifier RDV' : 'Nouveau RDV'}
            </Text>
            <TouchableOpacity onPress={handleSaveAppointment}>
              <Text style={styles.modalSaveText}>Sauver</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Patient *</Text>
            <View style={styles.pickerContainer}>
              {patients.map(patient => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    formData.patientId === patient.id && styles.patientOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, patientId: patient.id })}
                >
                  <Text style={[
                    styles.patientOptionText,
                    formData.patientId === patient.id && styles.patientOptionTextSelected
                  ]}>
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Date *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>Heure *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
              placeholder="HH:MM"
            />

            <Text style={styles.inputLabel}>Type de consultation *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.type}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
              placeholder="Consultation générale, Suivi, etc."
            />

            <Text style={styles.inputLabel}>Symptômes</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.symptoms}
              onChangeText={(text) => setFormData({ ...formData, symptoms: text })}
              placeholder="Symptômes rapportés par le patient"
              multiline
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Notes additionnelles"
              multiline
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    margin: 10,
    marginTop: 5,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentPatient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentType: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 4,
  },
  appointmentDateTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  appointmentSymptoms: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  appointmentNotes: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCancelText: {
    color: '#6b7280',
    fontSize: 16,
  },
  modalSaveText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 5,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  patientOption: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  patientOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  patientOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  patientOptionTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;
