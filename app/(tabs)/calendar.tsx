import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase"; // ✅ chemin corrigé (grâce à tsconfig.json)
import { useAuth } from "@/contexts/AuthContext"; // ✅ ton contexte user

export default function CalendarScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingSlots, setExistingSlots] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  // Liste des créneaux horaires (08h → 04h)
  const slots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
  ];

  // Charger les disponibilités existantes depuis Supabase
  const fetchDisponibilites = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("disponibilites")
      .select("heure_debut")
      .eq("pro_id", user.id)
      .eq("date", selectedDate.toISOString().split("T")[0]);

    if (error) {
      console.error(error);
      return;
    }

    setExistingSlots(data.map((d) => d.heure_debut));
  };

  useEffect(() => {
    fetchDisponibilites();
  }, [selectedDate]);

  // Ajouter ou supprimer un créneau
  const toggleSlot = async (slot: string) => {
    try {
      if (!user?.id) {
        Alert.alert("Erreur", "Utilisateur non connecté");
        return;
      }

      const [hour] = slot.split(":");
      const start = `${hour.padStart(2, "0")}:00:00`;
      const endHour = (parseInt(hour) + 1) % 24;
      const end = `${endHour.toString().padStart(2, "0")}:00:00`;
      const dateStr = selectedDate.toISOString().split("T")[0];

      if (existingSlots.includes(start)) {
        // 🔴 SUPPRESSION
        const { error } = await supabase
          .from("disponibilites")
          .delete()
          .eq("pro_id", user.id)
          .eq("date", dateStr)
          .eq("heure_debut", start);

        if (error) throw error;

        setExistingSlots(existingSlots.filter((s) => s !== start));
      } else {
        // 🟢 INSERTION
        const { error } = await supabase.from("disponibilites").insert([
          {
            pro_id: user.id,
            date: dateStr,
            heure_debut: start,
            heure_fin: end,
            etat: "disponible",
          },
        ]);

        if (error) throw error;

        setExistingSlots([...existingSlots, start]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Erreur", "Impossible de modifier le créneau");
    }
  };

  return (
    <View style={styles.container}>
      {/* Sélecteur de date */}
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>
          📅 {selectedDate.toLocaleDateString("fr-FR")}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Text style={styles.title}>Mes créneaux ({slots.length})</Text>

      <View style={styles.slotsContainer}>
        {slots.map((slot) => {
          const [hour] = slot.split(":");
          const start = `${hour.padStart(2, "0")}:00:00`;
          const isActive = existingSlots.includes(start);

          return (
            <TouchableOpacity
              key={slot}
              onPress={() => toggleSlot(slot)}
              style={[styles.slot, isActive ? styles.slotActive : styles.slotInactive]}
            >
              <Text style={isActive ? styles.slotTextActive : styles.slotTextInactive}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  dateButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    marginBottom: 15,
  },
  dateText: { color: "white", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 15 },
  slotsContainer: { flexDirection: "row", flexWrap: "wrap" },
  slot: {
    width: "22%",
    margin: "1%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  slotInactive: { backgroundColor: "#333" },
  slotActive: { backgroundColor: "#4caf50" },
  slotTextInactive: { color: "white" },
  slotTextActive: { color: "white", fontWeight: "bold" },
});
