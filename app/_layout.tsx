import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider } from "@/contexts/AuthContext";
import type { ToastConfig } from "react-native-toast-message";
import { View, Text, Platform, StyleSheet } from "react-native";
import Toast from "react-native-toast-message"; // Import fixe

// Styles cross-platform
const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  android: {
    elevation: 6,
  },
  default: {},
});

// Config Toast
const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastContainerSuccess, shadowStyle as any]}>
      <Text style={styles.toastText}>{text1}</Text>
      {text2 && <Text style={styles.toastSubText}>{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainerError, shadowStyle as any]}>
      <Text style={styles.toastText}>{text1}</Text>
      {text2 && <Text style={styles.toastSubText}>{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.toastContainerInfo, shadowStyle as any]}>
      <Text style={styles.toastText}>{text1}</Text>
      {text2 && <Text style={styles.toastSubText}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainerSuccess: {
    backgroundColor: "#e6ffed",
    padding: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#2ecc71",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  toastContainerError: {
    backgroundColor: "#ffe6e6",
    padding: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#e74c3c",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  toastContainerInfo: {
    backgroundColor: "#e8f4ff",
    padding: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#3498db",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  toastText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  toastSubText: {
    fontSize: 14,
    color: "#444",
  },
});

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      {/* Navigation root */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Overlays */}
      <>
        <Toast config={toastConfig} />
        {Platform.OS !== "web" && <StatusBar style="light" />}
      </>
    </AuthProvider>
  );
}
