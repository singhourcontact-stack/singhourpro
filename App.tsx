import React from "react";
import { Slot } from "expo-router";
import Toast from "react-native-toast-message";
import TestSupabase from "./TestSupabase";
import { injectSupabaseForDev } from "./lib/supabase";

// Inject only in dev for quick local testing (remove after test)
if (__DEV__) {
  // Remplace par ta vraie ANON key pour tester localement, puis supprime cette injection.
  injectSupabaseForDev(
    "https://xpuqugchktpwpxtlwsgb.supabase.co",
    "YOUR_ANON_KEY" // <- remplace ici pour tester
  );
}

export default function App() {
  return (
    <>
      <Slot />
      <Toast /> {/* ici pour que les toasts s’affichent */}
      <TestSupabase />
    </>
  );
}
