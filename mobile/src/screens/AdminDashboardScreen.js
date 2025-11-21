import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../auth/AuthContext";

export function AdminDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name ?? "Admin"}</Text>
      <Text style={styles.text}>Role: {user?.role}</Text>
      <Text style={styles.text}>College: {user?.collegeName ?? user?.collegeId}</Text>
      <View style={styles.actions}>
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#e5e7eb",
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
    textAlign: "center",
  },
  actions: {
    marginTop: 24,
    alignItems: "center",
  },
});


