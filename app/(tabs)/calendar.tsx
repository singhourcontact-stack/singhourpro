import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Settings } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { BlockedDate } from "@/types/database";
import { getAvailableTimeSlotsForDate, generateTimeSlotsFromWorkingHours } from "@/utils/workingHoursUtils";
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync";

export default function CalendarScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingSlots, setExistingSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [workingHoursSlots, setWorkingHoursSlots] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'availability' | 'blocking'>('availability');
  const [loading, setLoading] = useState(true);
  const [showGoogleCalendarSync, setShowGoogleCalendarSync] = useState(false);

  // Charger les disponibilités existantes depuis Supabase
  const fetchDisponibilites = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("disponibilites")
        .select("heure_debut")
        .eq("pro_id", user.id)
        .eq("date", selectedDate.toISOString().split("T")[0]);

      if (error) {
        console.error('Error fetching disponibilites:', error);
        setExistingSlots([]);
        return;
      }

      setExistingSlots(data?.map((d) => d.heure_debut) || []);
    } catch (err) {
      console.error('Error in fetchDisponibilites:', err);
      setExistingSlots([]);
    }
  };

  // Charger les créneaux bloqués depuis Supabase
  const fetchBlockedSlots = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("date, time_slots")
        .eq("professional_id", user.id)
        .eq("date", selectedDate.toISOString().split("T")[0]);

      if (error) {
        console.error('Error fetching blocked slots:', error);
        setBlockedSlots([]);
        return;
      }

      // Si des créneaux sont bloqués pour cette date
      const blockedData = data?.[0];
      if (blockedData?.time_slots) {
        setBlockedSlots(blockedData.time_slots);
      } else {
        setBlockedSlots([]);
      }
    } catch (err) {
      console.error('Error in fetchBlockedSlots:', err);
      setBlockedSlots([]);
    }
  };

  // Charger les heures de travail pour la date sélectionnée
  const fetchWorkingHours = async () => {
    if (!user?.id) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const availableSlots = await getAvailableTimeSlotsForDate(user.id, dateStr);
      setWorkingHoursSlots(availableSlots || []);
    } catch (error) {
      console.error('Error fetching working hours:', error);
      setWorkingHoursSlots([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDisponibilites(),
        fetchBlockedSlots(),
        fetchWorkingHours()
      ]);
      setLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [selectedDate, user]);

  // Ajouter ou supprimer un créneau (disponibilité)
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

        if (error) {
          console.error('Error deleting slot:', error);
          throw error;
        }

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

        if (error) {
          console.error('Error inserting slot:', error);
          throw error;
        }

        setExistingSlots([...existingSlots, start]);
      }
    } catch (err) {
      console.error('Error in toggleSlot:', err);
      Alert.alert("❌ Erreur", "Impossible de modifier le créneau");
    }
  };

  // Bloquer ou débloquer un créneau
  const toggleBlockedSlot = async (slot: string) => {
    try {
      if (!user?.id) {
        Alert.alert("Erreur", "Utilisateur non connecté");
        return;
      }

      const [hour] = slot.split(":");
      const start = `${hour.padStart(2, "0")}:00:00`;
      const dateStr = selectedDate.toISOString().split("T")[0];

      if (blockedSlots.includes(start)) {
        // 🔓 DÉBLOQUER
        const newBlockedSlots = blockedSlots.filter((s) => s !== start);
        
        if (newBlockedSlots.length === 0) {
          // Supprimer complètement l'entrée si plus de créneaux bloqués
          const { error } = await supabase
            .from("blocked_dates")
            .delete()
            .eq("professional_id", user.id)
            .eq("date", dateStr);
          
          if (error) {
            console.error('Error deleting blocked date:', error);
            throw error;
          }
        } else {
          // Mettre à jour avec les créneaux restants
          const { error } = await supabase
            .from("blocked_dates")
            .update({ time_slots: newBlockedSlots })
            .eq("professional_id", user.id)
            .eq("date", dateStr);
          
          if (error) {
            console.error('Error updating blocked date:', error);
            throw error;
          }
        }
        
        setBlockedSlots(newBlockedSlots);
      } else {
        // 🔒 BLOQUER
        const newBlockedSlots = [...blockedSlots, start];
        
        const { error } = await supabase
          .from("blocked_dates")
          .upsert({
            professional_id: user.id,
            date: dateStr,
            time_slots: newBlockedSlots,
          });
        
        if (error) {
          console.error('Error upserting blocked date:', error);
          throw error;
        }
        
        setBlockedSlots(newBlockedSlots);
      }
    } catch (err) {
      console.error('Error in toggleBlockedSlot:', err);
      Alert.alert("❌ Erreur", "Impossible de bloquer/débloquer le créneau");
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

      {/* Mode selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'availability' && styles.activeModeButton]}
          onPress={() => setMode('availability')}
        >
          <Text style={[styles.modeText, mode === 'availability' && styles.activeModeText]}>
            🟢 Disponibilités
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'blocking' && styles.activeModeButton]}
          onPress={() => setMode('blocking')}
        >
          <Text style={[styles.modeText, mode === 'blocking' && styles.activeModeText]}>
            🔴 Blocages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Google Calendar sync button */}
      <TouchableOpacity
        style={styles.googleSyncButton}
        onPress={() => setShowGoogleCalendarSync(true)}
      >
        <Calendar size={16} color="#ffffff" />
        <Text style={styles.googleSyncButtonText}>Google Calendar</Text>
        <Settings size={16} color="#ffffff" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {mode === 'availability' ? 'Mes créneaux disponibles' : 'Créneaux bloqués'} ({workingHoursSlots.length})
      </Text>

      {loading ? (
        <Text style={styles.loadingText}>Chargement des créneaux...</Text>
      ) : workingHoursSlots.length === 0 ? (
        <View style={styles.noWorkingHoursContainer}>
          <Text style={styles.noWorkingHoursText}>
            Aucune heure de travail définie pour cette date
          </Text>
          <Text style={styles.noWorkingHoursSubtext}>
            Configurez vos heures de travail dans les paramètres
          </Text>
        </View>
      ) : (
        <View style={styles.slotsContainer}>
          {workingHoursSlots.map((slot) => {
          const [hour] = slot.split(":");
          const start = `${hour.padStart(2, "0")}:00:00`;
          
          if (mode === 'availability') {
            const isActive = existingSlots.includes(start);
            const isBlocked = blockedSlots.includes(start);
            
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => toggleSlot(slot)}
                style={[
                  styles.slot, 
                  isBlocked ? styles.slotBlocked : (isActive ? styles.slotActive : styles.slotInactive)
                ]}
                disabled={isBlocked}
              >
                <Text style={[
                  isBlocked ? styles.slotTextBlocked : (isActive ? styles.slotTextActive : styles.slotTextInactive)
                ]}>
                  {slot}
                </Text>
                {isBlocked && <Text style={styles.blockedIndicator}>🚫</Text>}
              </TouchableOpacity>
            );
          } else {
            // Mode blocking
            const isBlocked = blockedSlots.includes(start);
            
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => toggleBlockedSlot(slot)}
                style={[
                  styles.slot, 
                  isBlocked ? styles.slotBlocked : styles.slotInactive
                ]}
              >
                <Text style={[
                  isBlocked ? styles.slotTextBlocked : styles.slotTextInactive
                ]}>
                  {slot}
                </Text>
                {isBlocked && <Text style={styles.blockedIndicator}>🚫</Text>}
              </TouchableOpacity>
            );
          }
        })}
        </View>
      )}

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarSync
        visible={showGoogleCalendarSync}
        onClose={() => setShowGoogleCalendarSync(false)}
      />
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
  modeSelector: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeModeButton: {
    backgroundColor: "#ff3b3b",
  },
  modeText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "600",
  },
  activeModeText: {
    color: "white",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 15 },
  slotsContainer: { flexDirection: "row", flexWrap: "wrap" },
  slot: {
    width: "22%",
    margin: "1%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  slotInactive: { backgroundColor: "#333" },
  slotActive: { backgroundColor: "#4caf50" },
  slotBlocked: { backgroundColor: "#ff3b3b" },
  slotTextInactive: { color: "white" },
  slotTextActive: { color: "white", fontWeight: "bold" },
  slotTextBlocked: { color: "white", fontWeight: "bold" },
  blockedIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    fontSize: 10,
  },
  loadingText: {
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  noWorkingHoursContainer: {
    padding: 20,
    alignItems: "center",
  },
  noWorkingHoursText: {
    color: "#ff3b3b",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  noWorkingHoursSubtext: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
  },
  googleSyncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  googleSyncButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
  },
});
