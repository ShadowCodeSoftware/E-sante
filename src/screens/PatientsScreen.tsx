"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
} from "react-native"
import { getPatients, addPatient, updatePatient } from "../database/database"
import type { Patient } from "../database/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type PatientsScreenProps = {
  navigation: NativeStackNavigationProp<any>
}

const PatientsScreen: React.FC<PatientsScreenProps> = ({ navigation }) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bloodType: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    medicalHistory: "",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [searchQuery, patients])

  const loadPatients = async () => {
    try {
      const patientsData = await getPatients()
      setPatients(patientsData)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les patients")
    }
  }

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery),
      )
      setFilteredPatients(filtered)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPatients()
    setRefreshing(false)
  }

  const openAddModal = () => {
    setEditingPatient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      bloodType: "",
      allergies: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      medicalHistory: "",
    })
    setModalVisible(true)
  }

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(", ") : "",
      emergencyContactName: patient.emergencyContact.name,
      emergencyContactPhone: patient.emergencyContact.phone,
      emergencyContactRelation: patient.emergencyContact.relation,
      medicalHistory: Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(", ") : "",
    })
    setModalVisible(true)
  }

  const handleSavePatient = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires")
      return
    }

    try {
      const patientData: Patient = {
        id: editingPatient?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        bloodType: formData.bloodType,
        allergies: formData.allergies
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        medicalHistory: formData.medicalHistory
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h),
        createdAt: editingPatient?.createdAt || new Date().toISOString(),
      }

      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData)
      } else {
        await addPatient(patientData)
      }

      setModalVisible(false)
      await loadPatients()
      Alert.alert("Succès", `Patient ${editingPatient ? "modifié" : "ajouté"} avec succès`)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le patient")
    }
  }

  const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
    <TouchableOpacity style={styles.patientCard} onPress={() => openEditModal(patient)}>
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.patientBloodType}>{patient.bloodType}</Text>
      </View>
      <Text style={styles.patientEmail}>{patient.email}</Text>
      <Text style={styles.patientPhone}>{patient.phone}</Text>
      <Text style={styles.patientBirth}>Né(e) le: {patient.dateOfBirth}</Text>
      {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
        <View style={styles.allergiesContainer}>
          <Text style={styles.allergiesLabel}>Allergies:</Text>
          <Text style={styles.allergiesText}>{patient.allergies.join(", ")}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un patient..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PatientCard patient={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun patient trouvé</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingPatient ? "Modifier Patient" : "Nouveau Patient"}</Text>
            <TouchableOpacity onPress={handleSavePatient}>
              <Text style={styles.modalSaveText}>Sauver</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nom complet"
            />

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Téléphone"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Date de naissance</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Adresse complète"
              multiline
            />

            <Text style={styles.inputLabel}>Groupe sanguin</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.bloodType}
              onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
              placeholder="A+, B-, O+, etc."
            />

            <Text style={styles.inputLabel}>Allergies (séparées par des virgules)</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.allergies}
              onChangeText={(text) => setFormData({ ...formData, allergies: text })}
              placeholder="Pénicilline, Arachides, etc."
              multiline
            />

            <Text style={styles.sectionTitle}>Contact d'urgence</Text>

            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.emergencyContactName}
              onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
              placeholder="Nom du contact d'urgence"
            />

            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.emergencyContactPhone}
              onChangeText={(text) => setFormData({ ...formData, emergencyContactPhone: text })}
              placeholder="Téléphone du contact d'urgence"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Relation</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.emergencyContactRelation}
              onChangeText={(text) => setFormData({ ...formData, emergencyContactRelation: text })}
              placeholder="Époux/se, Parent, etc."
            />

            <Text style={styles.inputLabel}>Antécédents médicaux (séparés par des virgules)</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.medicalHistory}
              onChangeText={(text) => setFormData({ ...formData, medicalHistory: text })}
              placeholder="Diabète, Hypertension, etc."
              multiline
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addButton: {
    backgroundColor: "#2563eb",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  patientCard: {
    backgroundColor: "#ffffff",
    margin: 10,
    marginTop: 5,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  patientBloodType: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
  patientEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  patientPhone: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  patientBirth: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  allergiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  allergiesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ef4444",
    marginRight: 5,
  },
  allergiesText: {
    fontSize: 12,
    color: "#ef4444",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalCancelText: {
    color: "#6b7280",
    fontSize: 16,
  },
  modalSaveText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 20,
    marginBottom: 10,
  },
})

export default PatientsScreen
