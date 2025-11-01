import { supabase } from '@/lib/supabase';
import { WorkingHours } from '@/types/database';

/**
 * Get working hours for a professional
 * @param professionalId - The professional's ID
 * @returns Promise<WorkingHours[]> - Array of working hours
 */
export async function getWorkingHours(professionalId: string): Promise<WorkingHours[]> {
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting working hours:', error);
    return [];
  }
}

/**
 * Get working hours for a specific day of the week
 * @param professionalId - The professional's ID
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @returns Promise<WorkingHours | null>
 */
export async function getWorkingHoursForDay(
  professionalId: string,
  dayOfWeek: number
): Promise<WorkingHours | null> {
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No working hours set for this day
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting working hours for day:', error);
    return null;
  }
}

/**
 * Generate time slots based on working hours
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns string[] - Array of time slots
 */
export function generateTimeSlotsFromWorkingHours(
  startTime: string,
  endTime: string
): string[] {
  const slots: string[] = [];
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  // Handle overnight shifts (e.g., 22:00 to 06:00)
  if (endHour < startHour) {
    // First part: from start to midnight
    for (let hour = startHour; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    // Second part: from midnight to end
    for (let hour = 0; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  } else {
    // Normal day shift
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }
  
  return slots;
}

/**
 * Get all available time slots for a professional on a specific date
 * @param professionalId - The professional's ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise<string[]> - Array of available time slots
 */
export async function getAvailableTimeSlotsForDate(
  professionalId: string,
  date: string
): Promise<string[]> {
  try {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // Get working hours for this day
    const workingHours = await getWorkingHoursForDay(professionalId, dayOfWeek);
    
    if (!workingHours) {
      return []; // No working hours set for this day
    }
    
    // Generate time slots based on working hours
    const allSlots = generateTimeSlotsFromWorkingHours(
      workingHours.start_time,
      workingHours.end_time
    );
    
    // Get blocked slots for this date
    const { data: blockedData, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('time_slots')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .single();

    const blockedSlots = blockedData?.time_slots || [];
    
    // Get existing bookings
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('reservations')
      .select('time')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) {
      throw bookingsError;
    }

    const bookedTimes = existingBookings?.map(b => b.time) || [];
    
    // Filter out blocked and booked slots
    const availableSlots = allSlots.filter(slot => {
      const timeFormatted = `${slot}:00`;
      return !blockedSlots.includes(timeFormatted) && !bookedTimes.includes(slot);
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots for date:', error);
    return [];
  }
}

/**
 * Save working hours for a professional
 * @param professionalId - The professional's ID
 * @param workingHours - Array of working hours to save
 * @returns Promise<boolean> - Success status
 */
export async function saveWorkingHours(
  professionalId: string,
  workingHours: Omit<WorkingHours, 'id' | 'professional_id' | 'created_at' | 'updated_at'>[]
): Promise<boolean> {
  try {
    // First, deactivate all existing working hours
    await supabase
      .from('working_hours')
      .update({ is_active: false })
      .eq('professional_id', professionalId);

    // Insert new working hours
    const workingHoursToInsert = workingHours.map(wh => ({
      ...wh,
      professional_id: professionalId,
    }));

    const { error } = await supabase
      .from('working_hours')
      .insert(workingHoursToInsert);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving working hours:', error);
    return false;
  }
}
