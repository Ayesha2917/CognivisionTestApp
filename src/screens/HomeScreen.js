import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
          } catch (e) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.title}>Cognivision Test App Dashboard</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AR Feature</Text>
          <View style={styles.arPlaceholder}>
            <Text style={styles.arPlaceholderText}>AR View Placeholder</Text>
          </View>
          <TouchableOpacity
            style={styles.arButton}
            onPress={() => Alert.alert('AR', 'Starting AR feature...')}
          >
            <Text style={styles.arButtonText}>Start AR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#757575',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  arPlaceholder: {
    height: 200,
    backgroundColor: '#E1BEE7',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#6A1B9A',
    borderStyle: 'dashed',
  },
  arPlaceholderText: {
    color: '#6A1B9A',
    fontSize: 16,
    fontWeight: '600',
  },
  arButton: {
    backgroundColor: '#6A1B9A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  arButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: '#6A1B9A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#6A1B9A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
