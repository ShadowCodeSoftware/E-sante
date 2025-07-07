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
import { getMedicalRecords, getPatients, addMedicalRecord } from "../database/database"
import type { MedicalRecord, Patient } from "../database/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<any>
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "consultation" | "examination" | "surgery" | "test" | "vaccination"
  >("all")
  const [formData, setFormData] = useState({
    patientId: "",
    type: "consultation" as MedicalRecord["type"],
    title: "",
    description: "",
    diagnosis: "",
    treatment: "",
    date: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchQuery, records, selectedFilter])

  const loadData = async () => {
    try {
      const [recordsData, patientsData] = await Promise.all([getMedicalRecords(), getPatients()])
      setRecords(recordsData)
      setPatients(patientsData)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données")
    }
  }

  const filterRecords = () => {
    let filtered = records

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtre par type
    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.type === selectedFilter)
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredRecords(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const openAddModal = () => {
    setFormData({
      patientId: "",
      type: "consultation",
      title: "",
      description: "",
      diagnosis: "",
      treatment: "",
      date: new Date().toISOString().split("T")[0],
    })
    setModalVisible(true)
  }

  const handleSaveRecord = async () => {
    if (!formData.patientId || !formData.title || !formData.description) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const selectedPatient = patients.find((p) => p.id === formData.patientId)
      if (!selectedPatient) {
        Alert.alert("Erreur", "Patient non trouvé")
        return
      }

      const recordData: MedicalRecord = {
        id: Date.now().toString(),
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        doctorId: "1", // À adapter selon l'utilisateur connecté
        doctorName: "Dr. Marie Dubois", // À adapter selon l'utilisateur connecté
        date: formData.date,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        createdAt: new Date().toISOString(),
      }

      await addMedicalRecord(recordData)
      setModalVisible(false)
      await loadData()
      Alert.alert("Succès", "Dossier médical ajouté avec succès")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le dossier médical")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return "👨‍⚕️"
      case "examination":
        return "🔍"
      case "surgery":
        return "🏥"
      case "test":
        return "🧪"
      case "vaccination":
        return "💉"
      default:
        return "📋"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consultation"
      case "examination":
        return "Examen"
      case "surgery":
        return "Chirurgie"
      case "test":
        return "Test/Analyse"
      case "vaccination":
        return "Vaccination"
      default:
        return type
    }
  }

  const RecordCard: React.FC<{ record: MedicalRecord }> = ({ record }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Text style={styles.recordIcon}>{getTypeIcon(record.type)}</Text>
          <View style={styles.recordTitleText}>
            <Text style={styles.recordTitle}>{record.title}</Text>
            <Text style={styles.recordPatient}>{record.patientName}</Text>
          </View>
        </View>
        <View style={styles.recordMeta}>
          <Text style={styles.recordDate}>{record.date}</Text>
          <Text style={styles.recordType}>{getTypeLabel(record.type)}</Text>
        </View>
      </View>

      <Text style={styles.recordDescription}>{record.description}</Text>

      {record.diagnosis && (
        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Diagnostic:</Text>
          <Text style={styles.recordSectionText}>{record.diagnosis}</Text>
        </View>
      )}

      {record.treatment && (
        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Traitement:</Text>
          <Text style={styles.recordSectionText}>{record.treatment}</Text>
        </View>
      )}

      <Text style={styles.recordDoctor}>Par: {record.doctorName}</Text>
    </View>
  )

  const FilterButton: React.FC<{
    filter: typeof selectedFilter
    title: string
    icon: string
    count: number
  }> = ({ filter, title, icon, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={styles.filterIcon}>{icon}</Text>
      <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  )

  const getFilterCounts = () => {
    return {
      all: records.length,
      consultation: records.filter((r) => r.type === "consultation").length,
      examination: records.filter((r) => r.type === "examination").length,
      surgery: records.filter((r) => r.type === "surgery").length,
      test: records.filter((r) => r.type === "test").length,
      vaccination: records.filter((r) => r.type === "vaccination").length,
    }
  }

  const filterCounts = getFilterCounts()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans l'historique..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <FilterButton filter="all" title="Tous" icon="📋" count={filterCounts.all} />
        <FilterButton filter="consultation" title="Consultations" icon="👨‍⚕️" count={filterCounts.consultation} />
        <FilterButton filter="examination" title="Examens" icon="🔍" count={filterCounts.examination} />
        <FilterButton filter="test" title="Tests" icon="🧪" count={filterCounts.test} />
        <FilterButton filter="vaccination" title="Vaccins" icon="💉" count={filterCounts.vaccination} />
        <FilterButton filter="surgery" title="Chirurgies" icon="🏥" count={filterCounts.surgery} />
      </ScrollView>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecordCard record={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun dossier médical trouvé</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouveau Dossier</Text>
            <TouchableOpacity onPress={handleSaveRecord}>
              <Text style={styles.modalSaveText}>Sauver</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Patient *</Text>
            <View style={styles.pickerContainer}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.patientOption, formData.patientId === patient.id && styles.patientOptionSelected]}
                  onPress={() => setFormData({ ...formData, patientId: patient.id })}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      formData.patientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Type *</Text>
            <View style={styles.typeContainer}>
              {(["consultation", "examination", "surgery", "test", "vaccination"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, formData.type === type && styles.typeOptionSelected]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text style={styles.typeIcon}>{getTypeIcon(type)}</Text>
                  <Text style={[styles.typeOptionText, formData.type === type && styles.typeOptionTextSelected]}>
                    {getTypeLabel(type)}
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

            <Text style={styles.inputLabel}>Titre *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Titre du dossier médical"
            />

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description détaillée"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Diagnostic</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.diagnosis}
              onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
              placeholder="Diagnostic établi"
              multiline
            />

            <Text style={styles.inputLabel}>Traitement</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.treatment}
              onChangeText={(text) => setFormData({ ...formData, treatment: text })}
              placeholder="Traitement prescrit"
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterIcon: {
    fontSize: 16,
  },
  filterButtonText: {
    fontSize: 12,
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recordTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  recordTitleText: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  recordPatient: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  recordMeta: {
    alignItems: "flex-end",
  },
  recordDate: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  recordType: {
    fontSize: 12,
    color: "#9ca3af",
  },
  recordDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
    lineHeight: 20,
  },
  recordSection: {
    marginBottom: 8,
  },
  recordSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  recordSectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
  },
  recordDoctor: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 8,
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
  pickerContainer: {
    marginBottom: 10,
  },
  patientOption: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  patientOptionSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  patientOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  patientOptionTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  typeOption: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: "45%",
  },
  typeOptionSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  typeIcon: {
    fontSize: 16,
  },
  typeOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  typeOptionTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
})

export default HistoryScreen
