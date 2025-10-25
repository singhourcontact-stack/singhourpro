import { supabase } from '@/lib/supabase';
import { validateBookingSlot } from '@/utils/blockingUtils';

export interface CreateBookingData {
  client_id: string;
  professional_id: string;
  offer_id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: string;
  location: string;
  message?: string;
  price: number;
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  error?: string;
}

/**
 * Create a new booking with blocking validation
 * @param bookingData - The booking data
 * @returns Promise<BookingResult>
 */
export async function createBooking(bookingData: CreateBookingData): Promise<BookingResult> {
  try {
    // First, validate that the time slot is not blocked
    const validation = await validateBookingSlot(
      bookingData.professional_id,
      bookingData.date,
      bookingData.time
    );

    if (!validation.canBook) {
      return {
        success: false,
        error: validation.reason || 'Ce créneau n\'est pas disponible'
      };
    }

    // Check if there's already a booking at this time
    const { data: existingBooking, error: checkError } = await supabase
      .from('reservations')
      .select('id')
      .eq('professional_id', bookingData.professional_id)
      .eq('date', bookingData.date)
      .eq('time', bookingData.time)
      .in('status', ['pending', 'confirmed']);

    if (checkError) {
      throw checkError;
    }

    if (existingBooking && existingBooking.length > 0) {
      return {
        success: false,
        error: 'Un rendez-vous existe déjà à cette heure'
      };
    }

    // Create the booking
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        client_id: bookingData.client_id,
        professional_id: bookingData.professional_id,
        offer_id: bookingData.offer_id,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        location: bookingData.location,
        message: bookingData.message,
        price: bookingData.price,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      booking: data
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: 'Erreur lors de la création du rendez-vous'
    };
  }
}

/**
 * Get available time slots for a professional on a specific date
 * @param professionalId - The professional's ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise<string[]> - Array of available time slots
 */
export async function getAvailableTimeSlots(
  professionalId: string,
  date: string
): Promise<string[]> {
  try {
    // Get professional's availability for the date
    const { data: availability, error: availabilityError } = await supabase
      .from('disponibilites')
      .select('heure_debut, heure_fin')
      .eq('pro_id', professionalId)
      .eq('date', date)
      .eq('etat', 'disponible');

    if (availabilityError) {
      throw availabilityError;
    }

    if (!availability || availability.length === 0) {
      return []; // No availability set
    }

    // Get blocked time slots
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

    // Generate available time slots
    const availableSlots: string[] = [];
    
    for (const slot of availability) {
      const startHour = parseInt(slot.heure_debut.split(':')[0]);
      const endHour = parseInt(slot.heure_fin.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const timeSlotFormatted = `${timeSlot}:00`;
        
        // Check if slot is not blocked and not already booked
        if (!blockedSlots.includes(timeSlotFormatted) && !bookedTimes.includes(timeSlot)) {
          availableSlots.push(timeSlot);
        }
      }
    }

    return availableSlots.sort();
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
}

/**
 * Update booking status (accept/refuse)
 * @param bookingId - The booking ID
 * @param status - New status
 * @returns Promise<BookingResult>
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'refused' | 'cancelled'
): Promise<BookingResult> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      booking: data
    };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return {
      success: false,
      error: 'Erreur lors de la mise à jour du rendez-vous'
    };
  }
}

