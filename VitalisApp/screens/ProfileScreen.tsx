import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the type for your navigation stack
type RootStackParamList = {
  Login: undefined;
};

const ProfileScreen = () => {
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Function to fetch patient data
  const fetchPatientData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'No access token found');
        return;
      }

      const response = await fetch('https://app.vitalis.nesechete.com/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }

      const data = await response.json();
      setPatientData(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchPatientData();
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      navigation.navigate('Login'); // Navigate to the login screen
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!patientData) {
    return (
      <View style={styles.container}>
        <Text>No patient data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Profile</Text>
      <Text style={styles.name}>Name: {patientData.name}</Text>
      <FlatList
        data={patientData.records}
        keyExtractor={(item) => item.Id.toString()}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>Timestamp: {item.Timestamp}</Text>
            <Text>Longitude: {item.Longitude}</Text>
            <Text>Latitude: {item.Latitude}</Text>
            <Text>Blood Oxidation: {item.BloodOxidation}</Text>
            <Text>Heart Rate: {item.HeartRate}</Text>
          </View>
        )}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  record: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default ProfileScreen;
