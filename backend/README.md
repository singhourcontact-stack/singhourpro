# 🔐 Google Calendar Token Exchange Backend

This backend endpoint handles the secure OAuth token exchange for Google Calendar integration.

## ⚠️ Why Backend is Required

The OAuth token exchange requires the **Client Secret**, which **MUST NEVER** be exposed in client-side code. This backend endpoint securely handles the token exchange using the client secret stored on the server.

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Calendar credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
PORT=3000
```

### 3. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured PORT).

---

## 📋 API Endpoints

### `POST /api/google-calendar/token`

Exchange authorization code for access token.

**Request:**
```json
{
  "code": "authorization_code_from_google",
  "redirect_uri": "singhours://google-calendar-callback"
}
```

**Response (Success):**
```json
{
  "access_token": "ya29.a0...",
  "refresh_token": "1//0g...",
  "expires_in": 3599,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/calendar.readonly"
}
```

**Response (Error):**
```json
{
  "error": "Token exchange failed",
  "message": "Invalid authorization code"
}
```

### `GET /api/google-calendar/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-24T12:00:00.000Z",
  "configured": true
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Your Google OAuth Client Secret |
| `PORT` | No | Server port (default: 3000) |

---

## 🚢 Deployment Options

### Option 1: Vercel (Recommended for Easy Setup)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

4. **Update app.json:**
   ```json
   "googleCalendarBackendUrl": "https://your-project.vercel.app"
   ```

### Option 2: Railway

1. **Connect Repository to Railway**
2. **Set Environment Variables** in Railway dashboard
3. **Deploy** - Railway auto-deploys

### Option 3: Heroku

1. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables:**
   ```bash
   heroku config:set GOOGLE_CLIENT_ID=your-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-secret
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 4: Supabase Edge Functions (Alternative)

See `supabase/functions/google-calendar-token/index.ts` for Supabase Edge Function implementation.

**Deploy:**
```bash
supabase functions deploy google-calendar-token
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** - Never hardcode secrets
3. **Enable HTTPS** - Use HTTPS in production
4. **Rate limiting** - Consider adding rate limiting to prevent abuse
5. **CORS** - Configure CORS properly for production

---

## 🐛 Troubleshooting

### "Google Calendar credentials not configured"
- Check `.env` file exists and has correct values
- Verify environment variables are set in your hosting platform

### "Token exchange failed"
- Verify redirect_uri matches Google Cloud Console settings
- Check authorization code hasn't expired
- Verify Client ID and Secret are correct

### "Backend connection failed"
- Verify backend URL in `app.json` is correct
- Check if backend server is running
- Verify CORS is configured if needed

---

## 📚 Next Steps

1. **Deploy backend** to your preferred platform
2. **Add backend URL** to `app.json`:
   ```json
   "googleCalendarBackendUrl": "https://your-backend-url.com"
   ```
3. **Test the integration** in your app

---

**The backend is now ready! Deploy it and add the URL to your app configuration.** 🎉

