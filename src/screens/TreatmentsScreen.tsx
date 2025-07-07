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
import { getTreatments, getPatients, addTreatment, updateTreatment } from "../database/database"
import type { Treatment, Patient } from "../database/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type TreatmentsScreenProps = {
  navigation: NativeStackNavigationProp<any>
}

const TreatmentsScreen: React.FC<TreatmentsScreenProps> = ({ navigation }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "actif" | "terminé" | "suspendu">("all")
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTreatments()
  }, [searchQuery, treatments, selectedFilter])

  const loadData = async () => {
    try {
      const [treatmentsData, patientsData] = await Promise.all([getTreatments(), getPatients()])
      setTreatments(treatmentsData)
      setPatients(patientsData)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données")
    }
  }

  const filterTreatments = () => {
    let filtered = treatments

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (treatment) =>
          treatment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          treatment.medication.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtre par statut
    if (selectedFilter !== "all") {
      filtered = filtered.filter((treatment) => treatment.status === selectedFilter)
    }

    // Trier par date de création (plus récent en premier)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTreatments(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const openAddModal = () => {
    setEditingTreatment(null)
    setFormData({
      patientId: "",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      startDate: "",
      endDate: "",
    })
    setModalVisible(true)
  }

  const openEditModal = (treatment: Treatment) => {
    setEditingTreatment(treatment)
    setFormData({
      patientId: treatment.patientId,
      medication: treatment.medication,
      dosage: treatment.dosage,
      frequency: treatment.frequency,
      duration: treatment.duration,
      instructions: treatment.instructions,
      startDate: treatment.startDate,
      endDate: treatment.endDate || "",
    })
    setModalVisible(true)
  }

  const handleSaveTreatment = async () => {
    if (!formData.patientId || !formData.medication || !formData.dosage || !formData.frequency) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const selectedPatient = patients.find((p) => p.id === formData.patientId)
      if (!selectedPatient) {
        Alert.alert("Erreur", "Patient non trouvé")
        return
      }

      const treatmentData: Treatment = {
        id: editingTreatment?.id || Date.now().toString(),
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        doctorId: "1", // À adapter selon l'utilisateur connecté
        doctorName: "Dr. Marie Dubois", // À adapter selon l'utilisateur connecté
        medication: formData.medication,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions,
        status: editingTreatment?.status || "actif",
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        createdAt: editingTreatment?.createdAt || new Date().toISOString(),
      }

      if (editingTreatment) {
        await updateTreatment(editingTreatment.id, treatmentData)
      } else {
        await addTreatment(treatmentData)
      }

      setModalVisible(false)
      await loadData()
      Alert.alert("Succès", `Traitement ${editingTreatment ? "modifié" : "ajouté"} avec succès`)
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le traitement")
    }
  }

  const updateTreatmentStatus = async (treatmentId: string, status: Treatment["status"]) => {
    try {
      await updateTreatment(treatmentId, { status })
      await loadData()
      Alert.alert("Succès", "Statut mis à jour")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "actif":
        return "#10b981"
      case "terminé":
        return "#6b7280"
      case "suspendu":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const TreatmentCard: React.FC<{ treatment: Treatment }> = ({ treatment }) => (
    <TouchableOpacity style={styles.treatmentCard} onPress={() => openEditModal(treatment)}>
      <View style={styles.treatmentHeader}>
        <Text style={styles.treatmentPatient}>{treatment.patientName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(treatment.status) }]}>
          <Text style={styles.statusText}>{treatment.status}</Text>
        </View>
      </View>

      <Text style={styles.treatmentMedication}>{treatment.medication}</Text>
      <Text style={styles.treatmentDosage}>
        💊 {treatment.dosage} - {treatment.frequency}
      </Text>
      <Text style={styles.treatmentDuration}>📅 Durée: {treatment.duration}</Text>

      {treatment.instructions && <Text style={styles.treatmentInstructions}>📝 {treatment.instructions}</Text>}

      <View style={styles.treatmentDates}>
        <Text style={styles.treatmentDate}>Début: {treatment.startDate}</Text>
        {treatment.endDate && <Text style={styles.treatmentDate}>Fin: {treatment.endDate}</Text>}
      </View>

      {treatment.status === "actif" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#6b7280" }]}
            onPress={() => updateTreatmentStatus(treatment.id, "terminé")}
          >
            <Text style={styles.actionButtonText}>Terminer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#f59e0b" }]}
            onPress={() => updateTreatmentStatus(treatment.id, "suspendu")}
          >
            <Text style={styles.actionButtonText}>Suspendre</Text>
          </TouchableOpacity>
        </View>
      )}

      {treatment.status === "suspendu" && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#10b981", alignSelf: "flex-start" }]}
          onPress={() => updateTreatmentStatus(treatment.id, "actif")}
        >
          <Text style={styles.actionButtonText}>Reprendre</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )

  const FilterButton: React.FC<{
    filter: typeof selectedFilter
    title: string
    count: number
  }> = ({ filter, title, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  )

  const getFilterCounts = () => {
    return {
      all: treatments.length,
      actif: treatments.filter((t) => t.status === "actif").length,
      terminé: treatments.filter((t) => t.status === "terminé").length,
      suspendu: treatments.filter((t) => t.status === "suspendu").length,
    }
  }

  const filterCounts = getFilterCounts()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un traitement..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <FilterButton filter="all" title="Tous" count={filterCounts.all} />
        <FilterButton filter="actif" title="Actifs" count={filterCounts.actif} />
        <FilterButton filter="terminé" title="Terminés" count={filterCounts.terminé} />
        <FilterButton filter="suspendu" title="Suspendus" count={filterCounts.suspendu} />
      </ScrollView>

      <FlatList
        data={filteredTreatments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TreatmentCard treatment={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun traitement trouvé</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingTreatment ? "Modifier Traitement" : "Nouveau Traitement"}</Text>
            <TouchableOpacity onPress={handleSaveTreatment}>
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

            <Text style={styles.inputLabel}>Médicament *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.medication}
              onChangeText={(text) => setFormData({ ...formData, medication: text })}
              placeholder="Nom du médicament"
            />

            <Text style={styles.inputLabel}>Dosage *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.dosage}
              onChangeText={(text) => setFormData({ ...formData, dosage: text })}
              placeholder="500mg, 10ml, etc."
            />

            <Text style={styles.inputLabel}>Fréquence *</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.frequency}
              onChangeText={(text) => setFormData({ ...formData, frequency: text })}
              placeholder="2 fois par jour, au besoin, etc."
            />

            <Text style={styles.inputLabel}>Durée</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="3 mois, permanent, etc."
            />

            <Text style={styles.inputLabel}>Instructions</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.instructions}
              onChangeText={(text) => setFormData({ ...formData, instructions: text })}
              placeholder="À prendre avec les repas, etc."
              multiline
            />

            <Text style={styles.inputLabel}>Date de début</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.startDate}
              onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>Date de fin (optionnelle)</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.endDate}
              onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              placeholder="YYYY-MM-DD"
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  treatmentCard: {
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
  treatmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  treatmentPatient: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  treatmentMedication: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
    marginBottom: 4,
  },
  treatmentDosage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  treatmentDuration: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  treatmentInstructions: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  treatmentDates: {
    marginBottom: 10,
  },
  treatmentDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
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
})

export default TreatmentsScreen
