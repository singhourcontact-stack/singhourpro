import { supabase } from '@/lib/supabase';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  allDay?: boolean;
}

export interface GoogleCalendarSyncSettings {
  id: string;
  professional_id: string;
  google_calendar_id: string;
  sync_enabled: boolean;
  auto_block_events: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get Google Calendar sync settings for a professional
 * @param professionalId - The professional's ID
 * @returns Promise<GoogleCalendarSyncSettings | null>
 */
export async function getGoogleCalendarSettings(
  professionalId: string
): Promise<GoogleCalendarSyncSettings | null> {
  try {
    const { data, error } = await supabase
      .from('google_calendar_sync')
      .select('*')
      .eq('professional_id', professionalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No settings found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting Google Calendar settings:', error);
    return null;
  }
}

/**
 * Save Google Calendar sync settings
 * @param settings - The sync settings
 * @returns Promise<boolean> - Success status
 */
export async function saveGoogleCalendarSettings(
  settings: Omit<GoogleCalendarSyncSettings, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('google_calendar_sync')
      .upsert(settings);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving Google Calendar settings:', error);
    return false;
  }
}

/**
 * Convert Google Calendar event to blocked time slots
 * @param event - Google Calendar event
 * @returns Array of blocked time slots
 */
export function convertEventToBlockedSlots(event: GoogleCalendarEvent): string[] {
  const blockedSlots: string[] = [];
  
  try {
    // Handle all-day events
    if (event.allDay || event.start.date) {
      // For all-day events, block the entire day
      return ['00:00:00', '01:00:00', '02:00:00', '03:00:00', '04:00:00', '05:00:00',
              '06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00', '11:00:00',
              '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00',
              '18:00:00', '19:00:00', '20:00:00', '21:00:00', '22:00:00', '23:00:00'];
    }

    // Handle timed events
    if (event.start.dateTime && event.end.dateTime) {
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      
      // Round start time down to the nearest hour
      const startHour = startTime.getHours();
      
      // Round end time up to the nearest hour
      const endHour = endTime.getMinutes() > 0 ? endTime.getHours() + 1 : endTime.getHours();
      
      // Generate blocked slots for each hour
      for (let hour = startHour; hour < endHour; hour++) {
        blockedSlots.push(`${hour.toString().padStart(2, '0')}:00:00`);
      }
    }
  } catch (error) {
    console.error('Error converting event to blocked slots:', error);
  }
  
  return blockedSlots;
}

/**
 * Sync Google Calendar events and create blocked time slots
 * @param professionalId - The professional's ID
 * @param events - Array of Google Calendar events
 * @param date - Date to sync events for (YYYY-MM-DD format)
 * @returns Promise<boolean> - Success status
 */
export async function syncGoogleCalendarEvents(
  professionalId: string,
  events: GoogleCalendarEvent[],
  date: string
): Promise<boolean> {
  try {
    // Get existing blocked slots for the date
    const { data: existingBlocked, error: fetchError } = await supabase
      .from('blocked_dates')
      .select('time_slots')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .single();

    let existingSlots: string[] = [];
    if (existingBlocked?.time_slots) {
      existingSlots = existingBlocked.time_slots;
    }

    // Convert events to blocked slots
    const newBlockedSlots: string[] = [];
    events.forEach(event => {
      const eventSlots = convertEventToBlockedSlots(event);
      newBlockedSlots.push(...eventSlots);
    });

    // Combine with existing blocked slots (remove duplicates)
    const allBlockedSlots = [...new Set([...existingSlots, ...newBlockedSlots])];

    // Update or create blocked date entry
    const { error: upsertError } = await supabase
      .from('blocked_dates')
      .upsert({
        professional_id: professionalId,
        date: date,
        time_slots: allBlockedSlots,
        source: 'google_calendar', // Add source tracking
      });

    if (upsertError) throw upsertError;

    // Update last sync time
    await supabase
      .from('google_calendar_sync')
      .update({ last_sync: new Date().toISOString() })
      .eq('professional_id', professionalId);

    return true;
  } catch (error) {
    console.error('Error syncing Google Calendar events:', error);
    return false;
  }
}

/**
 * Get Google Calendar events for a date range
 * Uses real Google Calendar API
 * @param professionalId - Professional's user ID (for authentication)
 * @param calendarId - Google Calendar ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Promise<GoogleCalendarEvent[]> - Array of events
 */
export async function fetchGoogleCalendarEvents(
  calendarId: string,
  startDate: string,
  endDate: string,
  professionalId?: string
): Promise<GoogleCalendarEvent[]> {
  // Import the service dynamically to avoid circular dependencies
  const googleCalendarService = await import('@/services/googleCalendarService');
  
  if (!professionalId) {
    console.error('Professional ID is required for Google Calendar API calls');
    return [];
  }

  try {
    const result = await googleCalendarService.fetchGoogleCalendarEvents(professionalId, calendarId, startDate, endDate);
    
    if (result.success && result.events) {
      return result.events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        allDay: event.allDay || !!event.start.date,
      }));
    }
    
    console.error('Error fetching Google Calendar events:', result.error);
    return [];
  } catch (error) {
    console.error('Error in fetchGoogleCalendarEvents:', error);
    return [];
  }
}

/**
 * Initialize Google Calendar sync for a professional
 * @param professionalId - The professional's ID
 * @param googleCalendarId - Google Calendar ID
 * @returns Promise<boolean> - Success status
 */
export async function initializeGoogleCalendarSync(
  professionalId: string,
  googleCalendarId: string
): Promise<boolean> {
  try {
    const settings: Omit<GoogleCalendarSyncSettings, 'id' | 'created_at' | 'updated_at'> = {
      professional_id: professionalId,
      google_calendar_id: googleCalendarId,
      sync_enabled: true,
      auto_block_events: true,
      last_sync: null,
    };

    return await saveGoogleCalendarSettings(settings);
  } catch (error) {
    console.error('Error initializing Google Calendar sync:', error);
    return false;
  }
}
