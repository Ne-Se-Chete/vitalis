import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="home-outline" size={size} color={color} />) }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarIcon: ({ color, size }) => (<FontAwesome5 name="user" size={size} color={color} />) }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="settings-outline" size={size} color={color} />) }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
