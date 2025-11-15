import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface DataResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Profile Management
 */
export async function updateProfile(profileId: string, updates: any): Promise<DataResult> {
  try {
    // Remove updated_at from updates if it doesn't exist in the schema
    const { updated_at, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la mise à jour du profil' };
  }
}

export async function getProfile(profileId: string): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la récupération du profil' };
  }
}

/**
 * Portfolio Management
 */
export async function addPortfolioPhoto(professionalId: string, photoUrl: string, category: string): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .insert({
        professional_id: professionalId,
        photo_url: photoUrl,
        category,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de l\'ajout de la photo' };
  }
}

export async function deletePortfolioPhoto(photoId: string): Promise<DataResult> {
  try {
    const { error } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', photoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la suppression de la photo' };
  }
}

export async function getPortfolioPhotos(professionalId: string): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la récupération du portfolio' };
  }
}

/**
 * Payment Information Management
 */
export async function updatePaymentInfo(profileId: string, paymentInfo: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        rib: paymentInfo.rib,
        bic: paymentInfo.bic,
        paypal_email: paymentInfo.paypalEmail,
        fiscal_info: paymentInfo.fiscalInfo,
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la mise à jour des informations de paiement' };
  }
}

/**
 * Notification Settings Management
 */
export async function updateNotificationSettings(profileId: string, settings: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        notification_settings: settings,
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la mise à jour des paramètres de notification' };
  }
}

/**
 * Working Hours Management
 */
export async function saveWorkingHours(professionalId: string, workingHours: any[]): Promise<DataResult> {
  try {
    // Delete existing working hours
    await supabase
      .from('working_hours')
      .delete()
      .eq('professional_id', professionalId);

    // Insert new working hours
    const { data, error } = await supabase
      .from('working_hours')
      .insert(workingHours.map(wh => ({ ...wh, professional_id: professionalId })))
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la sauvegarde des heures de travail' };
  }
}

/**
 * Blocked Dates Management
 */
export async function saveBlockedDates(professionalId: string, date: string, timeSlots: string[]): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .upsert({
        professional_id: professionalId,
        date,
        time_slots: timeSlots,
      }, { onConflict: 'professional_id,date' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la sauvegarde des créneaux bloqués' };
  }
}

/**
 * Offers Management
 */
export async function createOffer(professionalId: string, offerData: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        professional_id: professionalId,
        ...offerData,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la création de l\'offre' };
  }
}

export async function updateOffer(offerId: string, updates: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .update(updates)
      .eq('id', offerId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la mise à jour de l\'offre' };
  }
}

export async function deleteOffer(offerId: string): Promise<DataResult> {
  try {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la suppression de l\'offre' };
  }
}

/**
 * Reservations Management
 */
export async function createReservation(reservationData: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Send push notification to professional (async, don't block reservation creation)
    if (data) {
      const professionalId = data.pro_id || data.professional_id;
      const clientId = data.client_id;
      const serviceId = data.service_id || data.offer_id;
      const bookingDate = data.date;
      const bookingTime = data.heure || data.time;

      if (professionalId && clientId && bookingDate && bookingTime) {
        // Import dynamically to avoid circular dependency issues
        import('@/services/notificationService')
          .then(({ sendBookingNotification }) => {
            return sendBookingNotificationAsync(
              professionalId,
              clientId,
              serviceId,
              bookingDate,
              bookingTime
            );
          })
          .catch((err) => {
            console.error('Error sending booking notification:', err);
            // Don't fail reservation creation if notification fails
          });
      }
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la création de la réservation' };
  }
}

/**
 * Helper function to send booking notification (async)
 */
async function sendBookingNotificationAsync(
  professionalId: string,
  clientId: string,
  serviceId: string | undefined,
  bookingDate: string,
  bookingTime: string
): Promise<void> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { sendBookingNotification } = await import('@/services/notificationService');

    // Fetch client name
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('prenom, nom')
      .eq('id', clientId)
      .single();

    const clientName = clientProfile
      ? `${clientProfile.prenom || ''} ${clientProfile.nom || ''}`.trim() || 'Un client'
      : 'Un client';

    // Fetch service title - try services table first, then offers table
    let serviceTitle = 'un service';

    if (serviceId) {
      // Try to get service from services table
      const { data: service } = await supabase
        .from('services')
        .select('titre')
        .eq('id', serviceId)
        .single();

      if (service?.titre) {
        serviceTitle = service.titre;
      } else {
        // Fallback: try offers table
        const { data: offer } = await supabase
          .from('offers')
          .select('title')
          .eq('id', serviceId)
          .single();

        if (offer?.title) {
          serviceTitle = offer.title;
        }
      }
    }

    // Send notification
    await sendBookingNotification(
      professionalId,
      clientName,
      serviceTitle,
      bookingDate,
      bookingTime
    );
  } catch (error) {
    console.error('Error in sendBookingNotificationAsync:', error);
    // Swallow error - notification failure shouldn't break reservation creation
  }
}

export async function updateReservationStatus(reservationId: string, status: string): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la mise à jour du statut de la réservation' };
  }
}

/**
 * Google Calendar Settings
 */
export async function saveGoogleCalendarSettings(professionalId: string, settings: any): Promise<DataResult> {
  try {
    const { data, error } = await supabase
      .from('google_calendar_settings')
      .upsert({
        professional_id: professionalId,
        ...settings,
      }, { onConflict: 'professional_id' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la sauvegarde des paramètres Google Calendar' };
  }
}

/**
 * Verify all data is saving correctly
 */
export async function verifyDataIntegrity(userId: string): Promise<DataResult> {
  try {
    const checks = await Promise.all([
      // Check profile exists
      supabase.from('profiles').select('id').eq('id', userId).single(),
      // Check if user has any offers
      supabase.from('offers').select('id').eq('professional_id', userId),
      // Check if user has any reservations
      supabase.from('reservations').select('id').eq('professional_id', userId),
      // Check if user has working hours
      supabase.from('working_hours').select('id').eq('professional_id', userId),
    ]);

    const [profileCheck, offersCheck, reservationsCheck, workingHoursCheck] = checks;

    const results = {
      profile: profileCheck.data ? 'OK' : 'MISSING',
      offers: offersCheck.data?.length || 0,
      reservations: reservationsCheck.data?.length || 0,
      workingHours: workingHoursCheck.data?.length || 0,
    };

    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la vérification de l\'intégrité des données' };
  }
}
