import React from "react";
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const ProfileScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.profileHeader}>
      <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.profileImage} />
      <Text style={styles.profileName}>John Doe</Text>
      <Text style={styles.profileEmail}>johndoe@example.com</Text>
      <TouchableOpacity style={styles.editButton}>
        <FontAwesome5 name="edit" size={16} color="#FFF" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Your Stats</Text>
      <View style={styles.statsBox}><Text>Workouts Completed: 120</Text></View>
      <View style={styles.statsBox}><Text>Avg Heart Rate: 72 BPM</Text></View>
      <View style={styles.statsBox}><Text>Calories Burned: 48,200 kcal</Text></View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileName: { fontSize: 22, fontWeight: "bold" },
  profileEmail: { fontSize: 14, color: "gray" },
  editButton: { flexDirection: "row", backgroundColor: "#FF4D4D", padding: 10, borderRadius: 8, marginTop: 10 },
  editButtonText: { color: "#FFF", marginLeft: 5 },
  statsContainer: { marginTop: 20 },
  statsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  statsBox: { backgroundColor: "#FFF", padding: 15, borderRadius: 8, shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 10 },
});

export default ProfileScreen;
