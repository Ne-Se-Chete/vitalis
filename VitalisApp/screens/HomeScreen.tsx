import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, StyleSheet,
  Dimensions, TouchableOpacity, Linking, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width * 0.9;

const HomeScreen = () => {
  const [locationText, setLocationText] = useState('Fetching location...');
  const [mapsUrl, setMapsUrl] = useState('');
  const [hasInternet, setHasInternet] = useState(true);

  const data = [
    { value: 75, label: '9:00' },
    { value: 74, label: '10:00' },
    { value: 78, label: '11:00' },
    { value: 72, label: '12:00' },
    { value: 70, label: '13:00' },
    { value: 74, label: '14:00' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permission denied');

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setMapsUrl(`https://www.google.com/maps/search/hospital/@${latitude},${longitude},14z`);
        setLocationText('Nearest Hospital (tap to open)');
      } catch (error) {
        setHasInternet(false);
        setLocationText('No internet: Showing coordinates');
      }
    })();
  }, []);

  const handleOpenMaps = () => {
    if (!hasInternet) {
      Alert.alert('No Internet', 'Can’t open maps without internet connection.');
      return;
    }
    Linking.openURL(mapsUrl).catch(() =>
      Alert.alert('Error', 'Failed to open Google Maps.')
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Vitalis</Text>

        <View style={styles.bpmCard}>
          <View style={styles.bpmHeader}>
            <Text style={styles.bpmTitle}>Current BPM</Text>
            <Ionicons name="heart" size={20} color="#FF4D4D" />
          </View>
          <Text style={styles.bpmValue}>
            72 <Text style={styles.bpmStatus}>Normal Range</Text>
          </Text>

          <View>
            <View style={{ marginTop: 20, marginBottom: 10, alignSelf: 'flex-start' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>BPM Over Time</Text>
            </View>
            <LineChart
              data={data}
              width={300}
              height={220}
              isAnimated
              spacing={screenWidth / (data.length + 1)}
              hideDataPoints
              thickness={2}
              color="#007AFF"
              startFillColor="rgba(0, 122, 255, 0.3)"
              endFillColor="rgba(0, 122, 255, 0.1)"
              startOpacity={0.8}
              endOpacity={0.3}
              noOfSections={9}
              yAxisLabelSuffix=" bpm"
              yAxisColor="#ccc"
              xAxisColor="#ccc"
              rulesColor="#e0e0e0"
              yAxisTextStyle={{ color: '#777' }}
              xAxisLabelTextStyle={{ color: '#777' }}
              areaChart
              curved
            />
          </View>
        </View>

        <TouchableOpacity style={styles.infoCard} onPress={handleOpenMaps}>
          <Ionicons name="location-outline" size={20} color="#32B768" />
          <Text style={styles.location}>{locationText}</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsContainer}>
          <View style={styles.metricBox}><Text style={styles.metricText}>Blood Oxidation: 98%</Text></View>
          <View style={styles.metricBox}><Text style={styles.metricText}>Current BPM: 100</Text></View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  scrollContainer: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 20, color: '#333' },
  bpmCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
    width: screenWidth,
    marginBottom: 20,
  },
  bpmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  bpmTitle: { fontSize: 18, fontWeight: 'bold' },
  bpmValue: { fontSize: 30, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  bpmStatus: { fontSize: 14, color: 'green' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 20,
  },
  location: { marginLeft: 10, fontSize: 16, fontWeight: '500' },
  metricsContainer: { flexDirection: 'row', marginBottom: 20 },
  metricBox: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    height: 80,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginHorizontal: 6,
  },
  metricText: { fontSize: 16, fontWeight: '600' },
});

export default HomeScreen;
