# 🚀 Quick Start: Backend Setup for Google Calendar

## ⚡ Fastest Setup (5 minutes)

### Step 1: Choose Your Backend

You have two options:
1. **Node.js/Express** - Simple, works anywhere
2. **Supabase Edge Functions** - If you're using Supabase

---

## 📦 Option 1: Node.js/Express Backend

### 1. Setup Local Development

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file:
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
PORT=3000
```

### 3. Run Locally

```bash
npm start
```

Server runs on: `http://localhost:3000`

### 4. Deploy (Choose one):

**A. Vercel (Easiest):**
```bash
npm i -g vercel
vercel
# Follow prompts, set env vars in Vercel dashboard
```

**B. Railway:**
- Connect GitHub repo
- Auto-deploys
- Add env vars in Railway dashboard

**C. Heroku:**
```bash
heroku create
heroku config:set GOOGLE_CLIENT_ID=your-id
heroku config:set GOOGLE_CLIENT_SECRET=your-secret
git push heroku main
```

### 5. Update App Configuration

In `app.json`, add your deployed backend URL:
```json
"googleCalendarBackendUrl": "https://your-backend.vercel.app"
```

---

## 📦 Option 2: Supabase Edge Functions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Secrets

```bash
supabase secrets set GOOGLE_CLIENT_ID=your-client-id
supabase secrets set GOOGLE_CLIENT_SECRET=your-client-secret
```

### 5. Deploy Function

```bash
supabase functions deploy google-calendar-token
```

### 6. Update App Configuration

```json
"googleCalendarBackendUrl": "https://your-project.supabase.co/functions/v1"
```

Then update the service to use:
```typescript
`${config.backendUrl}/google-calendar-token`
```

---

## ✅ Test Your Backend

### Health Check:

```bash
curl https://your-backend-url.com/api/google-calendar/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-24T12:00:00.000Z",
  "configured": true
}
```

### Test Token Exchange:

```bash
curl -X POST https://your-backend-url.com/api/google-calendar/token \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code","redirect_uri":"singhours://callback"}'
```

---

## 🎉 You're Done!

1. ✅ Backend deployed
2. ✅ Backend URL added to `app.json`
3. ✅ Google Calendar integration ready to test!

---

**Need Help?** See `backend/README.md` for detailed instructions.

