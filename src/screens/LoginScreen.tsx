// import React from 'react';
// import { View, Text } from 'react-native';

// const LoginScreen = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>Login Screen</Text>
//   </View>
// );

// export default LoginScreen;

















import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsers } from '../database/database';
import { User } from '../database/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Typage des props navigation (ajustez selon votre navigation)
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const users: User[] = await getUsers();
      const user = users.find((u: User) => u.email === email && u.password === password);

      if (user) {
        await AsyncStorage.setItem('userToken', user.id);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        // Plutôt que navigation.reset, on laisse App gérer le changement d'état
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'Main' }],
        // });
        // On ne fait rien ici, App.tsx va détecter le token et afficher Main
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (userType: 'doctor' | 'patient') => {
    if (userType === 'doctor') {
      setEmail('admin@esante.com');
      setPassword('admin123');
    } else {
      setEmail('user@esante.com');
      setPassword('user123');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>eSanté</Text>
          <Text style={styles.subtitle}>Carnet de Santé Numérique</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Pas de compte ? S'inscrire
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Comptes de test :</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => fillTestCredentials('doctor')}
          >
            <Text style={styles.testButtonText}>Docteur (admin@esante.com)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => fillTestCredentials('patient')}
          >
            <Text style={styles.testButtonText}>Patient (user@esante.com)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
  },
  testSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default LoginScreen;