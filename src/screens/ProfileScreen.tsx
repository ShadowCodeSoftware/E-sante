"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getUsers, saveData } from "../database/database"
import type { User } from "../database/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    speciality: "",
    address: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("currentUser")
      if (userStr) {
        const user: User = JSON.parse(userStr)
        setCurrentUser(user)
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          speciality: user.speciality || "",
          address: user.address || "",
        })
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données utilisateur")
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUserData()
    setRefreshing(false)
  }

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const users = await getUsers()
      const userIndex = users.findIndex((u: User) => u.id === currentUser?.id)

      if (userIndex === -1) {
        Alert.alert("Erreur", "Utilisateur non trouvé")
        return
      }

      const updatedUser: User = {
        ...users[userIndex],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        speciality: formData.speciality || undefined,
        address: formData.address || undefined,
      }

      users[userIndex] = updatedUser
      await saveData("users", users)
      await AsyncStorage.setItem("currentUser", JSON.stringify(updatedUser))

      setCurrentUser(updatedUser)
      setEditModalVisible(false)
      Alert.alert("Succès", "Profil mis à jour avec succès")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil")
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (passwordData.currentPassword !== currentUser?.password) {
      Alert.alert("Erreur", "Mot de passe actuel incorrect")
      return
    }

    try {
      const users = await getUsers()
      const userIndex = users.findIndex((u: User) => u.id === currentUser?.id)

      if (userIndex === -1) {
        Alert.alert("Erreur", "Utilisateur non trouvé")
        return
      }

      const updatedUser: User = {
        ...users[userIndex],
        password: passwordData.newPassword,
      }

      users[userIndex] = updatedUser
      await saveData("users", users)
      await AsyncStorage.setItem("currentUser", JSON.stringify(updatedUser))

      setCurrentUser(updatedUser)
      setPasswordModalVisible(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      Alert.alert("Succès", "Mot de passe modifié avec succès")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier le mot de passe")
    }
  }

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken")
          await AsyncStorage.removeItem("currentUser")
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        },
      },
    ])
  }

  const ProfileItem: React.FC<{
    icon: string
    label: string
    value: string
    onPress?: () => void
  }> = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <Text style={styles.profileItemIcon}>{icon}</Text>
        <View>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Text style={styles.profileItemArrow}>›</Text>}
    </TouchableOpacity>
  )

  const ActionButton: React.FC<{
    icon: string
    title: string
    subtitle: string
    color: string
    onPress: () => void
  }> = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={[styles.actionButton, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.actionButtonIcon}>{icon}</Text>
      <View style={styles.actionButtonText}>
        <Text style={styles.actionButtonTitle}>{title}</Text>
        <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.actionButtonArrow}>›</Text>
    </TouchableOpacity>
  )

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Profile */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userRole}>{currentUser.role === "doctor" ? "👨‍⚕️ Docteur" : "👤 Patient"}</Text>
        {currentUser.speciality && <Text style={styles.userSpeciality}>{currentUser.speciality}</Text>}
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <ProfileItem icon="👤" label="Nom complet" value={currentUser.name} />

        <ProfileItem icon="📧" label="Email" value={currentUser.email} />

        <ProfileItem icon="📱" label="Téléphone" value={currentUser.phone} />

        {currentUser.speciality && <ProfileItem icon="🏥" label="Spécialité" value={currentUser.speciality} />}

        {currentUser.address && <ProfileItem icon="📍" label="Adresse" value={currentUser.address} />}

        <ProfileItem
          icon="📅"
          label="Membre depuis"
          value={new Date(currentUser.createdAt).toLocaleDateString("fr-FR")}
        />
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <ActionButton
          icon="✏️"
          title="Modifier le profil"
          subtitle="Mettre à jour vos informations"
          color="#2563eb"
          onPress={() => setEditModalVisible(true)}
        />

        <ActionButton
          icon="🔒"
          title="Changer le mot de passe"
          subtitle="Modifier votre mot de passe"
          color="#f59e0b"
          onPress={() => setPasswordModalVisible(true)}
        />

        <ActionButton
          icon="📊"
          title="Statistiques"
          subtitle="Voir vos statistiques d'utilisation"
          color="#10b981"
          onPress={() => Alert.alert("Info", "Fonctionnalité à venir")}
        />

        <ActionButton
          icon="⚙️"
          title="Paramètres"
          subtitle="Configurer l'application"
          color="#6b7280"
          onPress={() => Alert.alert("Info", "Fonctionnalité à venir")}
        />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleUpdateProfile}>
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

            {currentUser.role === "doctor" && (
              <>
                <Text style={styles.inputLabel}>Spécialité</Text>
                <TextInput
                  style={styles.modalInput}
                  value={formData.speciality}
                  onChangeText={(text) => setFormData({ ...formData, speciality: text })}
                  placeholder="Spécialité médicale"
                />
              </>
            )}

            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput
              style={styles.modalInput}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Adresse complète"
              multiline
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalSaveText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Mot de passe actuel *</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              placeholder="Mot de passe actuel"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Nouveau mot de passe *</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              placeholder="Nouveau mot de passe"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe *</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
              placeholder="Confirmer le nouveau mot de passe"
              secureTextEntry
            />

            <Text style={styles.passwordHint}>Le mot de passe doit contenir au moins 6 caractères</Text>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#2563eb",
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: "#e0e7ff",
    marginBottom: 5,
  },
  userSpeciality: {
    fontSize: 14,
    color: "#c7d2fe",
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  profileItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  profileItemLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  profileItemArrow: {
    fontSize: 20,
    color: "#9ca3af",
  },
  actionButton: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionButtonArrow: {
    fontSize: 20,
    color: "#9ca3af",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
  passwordHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    fontStyle: "italic",
  },
})

export default ProfileScreen
