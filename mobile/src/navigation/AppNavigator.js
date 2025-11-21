import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { StudentDashboardScreen } from "../screens/StudentDashboardScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function AppNavigator() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user && (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Sign in to Smart Campus" }}
          />
        )}

        {user?.role === "student" && (
          <Stack.Screen
            name="StudentDashboard"
            component={StudentDashboardScreen}
            options={{ title: "Student Dashboard" }}
          />
        )}

        {user?.role === "admin" && (
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ title: "Admin Dashboard" }}
          />
        )}

        {/* fallback */}
        {user && !["student", "admin"].includes(user.role) && (
          <Stack.Screen
            name="LoginFallback"
            component={LoginScreen}
            options={{ title: "Unsupported role" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


