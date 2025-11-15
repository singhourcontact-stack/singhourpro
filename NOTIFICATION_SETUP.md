# Push Notification Setup Guide

This guide explains how to set up and use push notifications in the Singhours Pro app using **Expo Notifications**.

## ✅ What's Implemented

### 1. **Push Notification Infrastructure**
- ✅ Expo Notifications package installed
- ✅ Push token registration service
- ✅ Token storage in Supabase (`push_tokens` table)
- ✅ Notification listeners for foreground/background
- ✅ Notification navigation handling

### 2. **Notification Service**
- ✅ Database notification storage (`notifications` table)
- ✅ Push notification sending via Expo Push API
- ✅ Booking notification triggers
- ✅ Payment notification support
- ✅ Notification settings management

### 3. **Backend Integration**
- ✅ Supabase Edge Function for sending push notifications
- ✅ Database trigger for automatic notifications (optional)

---

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

Make sure `expo-device` is installed (already added to package.json).

### Step 2: Create Database Tables

Run the SQL scripts in your Supabase dashboard:

1. **Push Tokens Table**
   ```sql
   -- Run: database/create-push-tokens-table.sql
   ```

2. **Verify Notifications Table**
   ```sql
   -- Make sure notifications table exists with pro_id column
   SELECT * FROM notifications LIMIT 1;
   ```

### Step 3: Configure App.json

The app.json is already configured with:
- Expo Notifications plugin
- EAS project ID (required for push tokens)

**Important**: For production, you'll need to:
1. Build with EAS Build (not Expo Go)
2. Configure APNs (iOS) and FCM (Android) credentials

### Step 4: Set Up Expo Push Notification Service

1. **Create Expo Account** (if you don't have one)
   ```bash
   npx expo login
   ```

2. **Verify EAS Project ID**
   - Your project ID is already in `app.json`: `117ea4e8-390c-4b86-ba3d-607af9313482`

3. **For iOS (Production)**
   - Generate APNs key in Apple Developer Portal
   - Upload to Expo: `eas credentials`
   - Or configure in EAS dashboard

4. **For Android (Production)**
   - FCM is configured automatically by Expo
   - No additional setup needed

---

## 📱 How It Works

### Registration Flow

1. **User Logs In** → `useNotifications` hook triggers
2. **Permissions Request** → App requests notification permissions
3. **Token Generation** → Expo generates push token
4. **Token Storage** → Token saved to Supabase `push_tokens` table
5. **Ready** → User can receive push notifications

### Sending Notifications

#### Method 1: Direct API Call (Current Implementation)

When a new booking is created:

```typescript
import { sendBookingNotification } from '@/services/notificationService';

await sendBookingNotification(
  professionalId,
  clientName,
  serviceTitle,
  bookingDate,
  bookingTime
);
```

This function:
1. Saves notification to database
2. Checks user notification settings
3. Gets active push tokens
4. Sends push notification to all devices

#### Method 2: Supabase Edge Function (Recommended for Production)

1. **Deploy Edge Function**:
   ```bash
   supabase functions deploy send-push-notification
   ```

2. **Trigger from Database** (optional):
   - Run `database/create-notification-trigger.sql`
   - Automatically sends push notifications when bookings are created

3. **Or Call Manually**:
   ```typescript
   await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       professionalId: '...',
       title: 'Nouvelle réservation',
       body: '...',
       data: { ... }
     })
   });
   ```

---

## 🧪 Testing

### 1. **Test on Physical Device**

Push notifications only work on physical devices, not simulators/emulators.

```bash
# Build development client
npx expo run:ios
# or
npx expo run:android
```

### 2. **Test Token Registration**

1. Login to the app
2. Check console logs for: "Push token registered: ExponentPushToken[...]"
3. Verify in Supabase: Check `push_tokens` table

### 3. **Test Sending Notification**

**Option A: From Code**
```typescript
import { scheduleLocalNotification } from '@/services/pushNotificationService';

await scheduleLocalNotification(
  'Test Notification',
  'This is a test notification',
  { type: 'test' }
);
```

**Option B: From Expo Push Tool**
1. Get push token from Supabase `push_tokens` table
2. Go to: https://expo.dev/notifications
3. Paste token and send test notification

**Option C: From Backend**
```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN]",
    "title": "Test",
    "body": "Test notification",
    "sound": "default"
  }'
```

---

## 📋 Notification Types

### Booking Notifications
- **Trigger**: New reservation created
- **Title**: "Nouvelle réservation"
- **Body**: Client name + service + date/time
- **Data**: `{ type: 'booking', clientName, serviceTitle, ... }`

### Payment Notifications
- **Trigger**: Payment status changes
- **Title**: "Paiement reçu" / "Paiement en attente" / "Échec de paiement"
- **Body**: Amount + currency + status
- **Data**: `{ type: 'payment', amount, currency, status }`

---

## ⚙️ Notification Settings

Users can control notifications via Settings screen:
- Booking notifications (on/off)
- Payment notifications (on/off)
- Marketing notifications (on/off)
- Push notifications (on/off)

Settings are stored in `notifications` table (same table, different row from notification logs).

---

## 🔧 Troubleshooting

### "Push notifications only work on physical devices"
- ✅ Expected: Simulators don't support push notifications
- Solution: Test on real device

### "Permission denied"
- ✅ User denied notification permissions
- Solution: Guide user to app settings to enable

### "EAS project ID not found"
- ✅ Check `app.json` → `extra.eas.projectId`
- Solution: Ensure EAS project is linked

### "No active push tokens found"
- ✅ Token not registered or user logged out
- Solution: Ensure user is logged in and permissions granted

### Notifications not received
1. Check token in `push_tokens` table
2. Verify `is_active = true`
3. Check user notification settings (`push_notifications = true`)
4. Test token with Expo Push Tool
5. Check device notification settings

---

## 🚀 Production Checklist

- [ ] Build app with EAS Build (not Expo Go)
- [ ] Configure APNs credentials (iOS)
- [ ] Verify FCM credentials (Android - auto-configured)
- [ ] Test push notifications on physical devices
- [ ] Deploy Supabase Edge Function
- [ ] Set up database triggers (optional)
- [ ] Monitor notification delivery rates
- [ ] Set up notification analytics

---

## 📚 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Service](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🔐 Security Notes

- Push tokens are user-specific and stored securely in Supabase
- RLS policies ensure users can only access their own tokens
- Notifications respect user privacy settings
- No sensitive data in notification payloads (use notification data for app navigation)

