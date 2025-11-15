-- Create database trigger to automatically send push notifications when a new booking is created
-- This trigger will call the Supabase Edge Function when a reservation is inserted

-- First, create a function to call the Edge Function via HTTP
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  professional_id UUID;
  client_name TEXT;
  service_title TEXT;
  booking_date DATE;
  booking_time TIME;
  payload JSONB;
BEGIN
  -- Get professional ID from the new reservation
  professional_id := NEW.pro_id;
  booking_date := NEW.date;
  booking_time := NEW.heure;
  
  -- Get client name from profiles
  SELECT CONCAT(prenom, ' ', nom) INTO client_name
  FROM profiles
  WHERE id = NEW.client_id;
  
  -- Get service title from services table
  SELECT titre INTO service_title
  FROM services
  WHERE id = NEW.service_id
  LIMIT 1;
  
  -- Build payload
  payload := jsonb_build_object(
    'professionalId', professional_id,
    'title', 'Nouvelle réservation',
    'body', COALESCE(client_name, 'Un client') || ' a réservé "' || COALESCE(service_title, 'un service') || '" le ' || TO_CHAR(booking_date, 'DD/MM/YYYY') || ' à ' || TO_CHAR(booking_time, 'HH24:MI'),
    'data', jsonb_build_object(
      'type', 'booking',
      'clientName', client_name,
      'serviceTitle', service_title,
      'bookingDate', TO_CHAR(booking_date, 'YYYY-MM-DD'),
      'bookingTime', TO_CHAR(booking_time, 'HH24:MI'),
      'reservationId', NEW.id
    )
  );
  
  -- Call Supabase Edge Function via pg_net (requires pg_net extension)
  -- Note: You'll need to enable pg_net extension in Supabase dashboard
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
      ),
      body := payload::text
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after a new reservation is inserted
CREATE TRIGGER trigger_notify_new_booking
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_new_booking();

-- Note: Alternative approach without pg_net (using HTTP via Supabase Edge Function webhook)
-- You can also use Supabase Database Webhooks in the dashboard to call the Edge Function
-- This is simpler and doesn't require pg_net extension

