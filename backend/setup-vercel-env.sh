#!/bin/bash
# Setup Vercel Environment Variables for Google Calendar Backend
# Run this script to add environment variables to your Vercel project

echo "🔧 Setting up Vercel Environment Variables for Google Calendar Backend"
echo ""
echo "You'll need your Google Calendar OAuth credentials from:"
echo "https://console.cloud.google.com/"
echo ""

# Read Google Client ID
read -p "Enter your GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo "❌ GOOGLE_CLIENT_ID is required!"
  exit 1
fi

# Read Google Client Secret
read -sp "Enter your GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
echo ""
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ GOOGLE_CLIENT_SECRET is required!"
  exit 1
fi

echo ""
echo "📤 Adding environment variables to Vercel..."

# Add environment variables
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🔄 Redeploying backend with new environment variables..."
vercel --prod --yes

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "Your backend URL is already configured in app.json:"
echo "https://backend-9miltg7dg-oreos-projects-5e942c3f.vercel.app"
echo ""
echo "🧪 Test the backend:"
echo "curl https://backend-9miltg7dg-oreos-projects-5e942c3f.vercel.app/api/google-calendar/health"

