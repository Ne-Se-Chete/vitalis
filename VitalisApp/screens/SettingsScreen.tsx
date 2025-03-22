import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingRow}>
        <Text>Notifications</Text>
        <Switch value={notifications} onValueChange={() => setNotifications(!notifications)} />
      </View>

      <View style={styles.settingRow}>
        <Text>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 20, color: '#333', alignSelf: "center" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#FFF", padding: 15, borderRadius: 8, shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 10 },
  logoutButton: { flexDirection: "row", backgroundColor: "#FF4D4D", padding: 15, borderRadius: 8, justifyContent: "center", marginTop: 20 },
  logoutText: { color: "#FFF", marginLeft: 10, fontSize: 16 },
});

export default SettingsScreen;
