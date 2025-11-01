import { supabase } from '@/lib/supabase';

/**
 * Check if a specific time slot is blocked for a professional
 * @param professionalId - The professional's ID
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format
 * @returns Promise<boolean> - true if blocked, false if available
 */
export async function isTimeSlotBlocked(
  professionalId: string,
  date: string,
  time: string
): Promise<boolean> {
  try {
    // Convert time to the format stored in database (HH:MM:SS)
    const timeFormatted = `${time}:00`;
    
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('time_slots')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .single();

    if (error) {
      // If no blocked dates found, slot is not blocked
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    // Check if the time slot is in the blocked slots array
    const blockedSlots = data?.time_slots || [];
    return blockedSlots.includes(timeFormatted);
  } catch (error) {
    console.error('Error checking if time slot is blocked:', error);
    // Return false on error to allow booking (fail-safe)
    return false;
  }
}

/**
 * Get all blocked time slots for a professional on a specific date
 * @param professionalId - The professional's ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise<string[]> - Array of blocked time slots
 */
export async function getBlockedTimeSlots(
  professionalId: string,
  date: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('time_slots')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return []; // No blocked slots
      }
      throw error;
    }

    return data?.time_slots || [];
  } catch (error) {
    console.error('Error getting blocked time slots:', error);
    return [];
  }
}

/**
 * Validate if a booking can be made (not blocked)
 * @param professionalId - The professional's ID
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format
 * @returns Promise<{canBook: boolean, reason?: string}>
 */
export async function validateBookingSlot(
  professionalId: string,
  date: string,
  time: string
): Promise<{canBook: boolean, reason?: string}> {
  try {
    const isBlocked = await isTimeSlotBlocked(professionalId, date, time);
    
    if (isBlocked) {
      return {
        canBook: false,
        reason: 'Ce créneau est bloqué par le professionnel'
      };
    }

    return { canBook: true };
  } catch (error) {
    console.error('Error validating booking slot:', error);
    return {
      canBook: false,
      reason: 'Erreur lors de la vérification de disponibilité'
    };
  }
}

