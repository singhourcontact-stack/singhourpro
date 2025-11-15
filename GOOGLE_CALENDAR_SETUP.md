# 📅 Google Calendar Integration Setup Guide

## 📋 Overview

This app now has **real Google Calendar integration** with OAuth authentication and event synchronization. This replaces the previous mock implementation.

---

## 🔧 Configuration Steps

### 1. Get Google Calendar API Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing):**
   - Click **"Select a project"** → **"New Project"**
   - Give it a name (e.g., "Singhours Pro")
   - Click **"Create"**

3. **Enable Google Calendar API:**
   - Navigate to **"APIs & Services"** → **"Library"**
   - Search for **"Google Calendar API"**
   - Click **"Enable"**

4. **Create OAuth 2.0 Credentials:**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - If prompted, configure OAuth consent screen:
     - Choose **"External"** (for testing) or **"Internal"** (for Google Workspace)
     - Fill in app information
     - Add scopes: `https://www.googleapis.com/auth/calendar.readonly`
   - Select **"Application type"**: **"Web application"** (or **"iOS"** / **"Android"** for native apps)
   - Add **Authorized redirect URIs:**
     - `singhours://google-calendar-callback` (for mobile app)
     - Your app's callback URL
   - Click **"Create"**
   - Copy the **Client ID** (you'll need this)

### 2. Configure in App

Update `app.json` with your Google Calendar Client ID:

```json
"extra": {
  "googleCalendarClientId": "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com",
  "googleCalendarEnvironment": "production",
  ...
}
```

---

## ⚠️ Important: Backend Token Exchange Required

**Critical Note:** The OAuth token exchange step requires your **Client Secret**, which **must never be exposed to the client**. 

### ✅ Backend Solution Provided

I've created a complete backend implementation for you! See `backend/` directory for:
- **Node.js/Express backend** (`backend/google-calendar-token.js`)
- **Supabase Edge Function** (`supabase/functions/google-calendar-token/index.ts`)
- **Full setup instructions** (`backend/README.md`)

### Quick Backend Setup:

1. **Choose your backend option:**
   - Node.js/Express (in `backend/` folder)
   - Supabase Edge Functions (in `supabase/functions/`)

2. **Deploy the backend:**
   - See `backend/README.md` for detailed deployment instructions
   - Options: Vercel, Railway, Heroku, or Supabase

3. **Add backend URL to app.json:**

   **For Node.js/Express backend:**
   ```json
   "googleCalendarBackendUrl": "https://your-backend.vercel.app"
   ```

   **For Supabase Edge Functions:**
   ```json
   "googleCalendarBackendUrl": "https://your-project.supabase.co/functions/v1"
   ```
   
   Then update `services/googleCalendarService.ts` line 179 to use:
   ```typescript
   const response = await fetch(`${config.backendUrl}/google-calendar-token`, {
   ```
   (without `/api/google-calendar/token`)

### Current Implementation:
- ✅ OAuth flow starts in the app
- ✅ User authenticates with Google
- ✅ Token exchange via backend endpoint (ready to use!)

---

## 🚀 How to Use

### Connecting Google Calendar

1. **Open Calendar Sync:**
   - Navigate to Calendar tab
   - Click "Sync Google Calendar" button

2. **OAuth Flow:**
   - Click **"Configurer"** button
   - Google login page opens in browser
   - User logs in and authorizes
   - App receives callback with authorization code
   - **Token exchange** happens (requires backend)

3. **Calendar Selection:**
   - App automatically selects primary calendar
   - Calendar is saved to database

### Synchronizing Events

1. **Manual Sync:**
   - Toggle **"Synchronisation"** switch ON
   - Click **"Synchroniser maintenant"** button
   - Events are fetched from Google Calendar
   - Events are converted to blocked time slots
   - Blocked slots appear in your calendar (red)

2. **Auto-Block:**
   - Toggle **"Blocage automatique"** ON
   - New events will be automatically blocked

---

## 🔐 Security Notes

1. **Never commit Client Secret to Git:**
   - Client Secret must stay on backend only
   - Use environment variables on backend

2. **OAuth Redirect URIs:**
   - Must match exactly in Google Cloud Console
   - Use app's custom URL scheme

3. **Token Storage:**
   - Access tokens stored securely in AsyncStorage
   - Consider encrypting tokens for production

---

## 📝 API Features Implemented

### ✅ Completed:
- ✅ Google OAuth 2.0 authentication flow
- ✅ Calendar list fetching
- ✅ Event fetching with date range
- ✅ Event to blocked slots conversion
- ✅ Automatic blocking of events
- ✅ Manual sync functionality
- ✅ Disconnect functionality

### ⚠️ Requires Backend:
- ⚠️ Token exchange (needs Client Secret)
- ⚠️ Refresh token management

---

## 🐛 Troubleshooting

### "Google Calendar Client ID not configured"
- Make sure you've added `googleCalendarClientId` to `app.json`
- Restart Metro bundler after changes

### "Authentication cancelled or failed"
- Check redirect URI matches in Google Cloud Console
- Verify OAuth consent screen is configured
- Check Client ID is correct

### "Token exchange failed"
- **Expected** - Token exchange requires backend endpoint
- See "Backend Token Exchange Required" section above

### "Not authenticated"
- User needs to go through OAuth flow again
- Check if tokens are stored in AsyncStorage

---

## 📚 Resources

- [Google Calendar API Docs](https://developers.google.com/calendar/api/v3/reference)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession](https://docs.expo.dev/guides/authentication/#google)

---

## ✅ Next Steps

1. **Get Google Calendar API credentials**
2. **Add Client ID** to `app.json`
3. **Set up backend endpoint** for token exchange (production)
4. **Test OAuth flow** in development
5. **Test event synchronization**

---

## 💡 Production Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs configured
- [ ] Client ID added to app.json
- [ ] Backend endpoint created for token exchange
- [ ] Token storage secured
- [ ] Tested OAuth flow end-to-end
- [ ] Tested event synchronization
- [ ] Error handling tested

---

**Note:** The Google Calendar integration now uses real APIs! However, you'll need a backend endpoint for the token exchange step in production. 🎉
