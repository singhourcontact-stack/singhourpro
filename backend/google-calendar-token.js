/**
 * Google Calendar Token Exchange Backend Endpoint
 * 
 * This endpoint handles the OAuth token exchange for Google Calendar
 * Client Secret MUST remain on backend and never be exposed to client
 * 
 * Usage:
 * POST /api/google-calendar/token
 * Body: { code: string, redirect_uri: string }
 * Returns: { access_token: string, refresh_token?: string, expires_in: number }
 */

const express = require('express');
// Use native fetch if Node 18+, otherwise install node-fetch
// For Node 18+: const fetch = globalThis.fetch;
const fetch = require('node-fetch'); // npm install node-fetch@2
const app = express();

// Middleware
app.use(express.json());

// CORS middleware (adjust origins for production)
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Environment variables (set these in your .env file or hosting platform)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Exchange authorization code for access token
 */
app.post('/api/google-calendar/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    // Validate input
    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both code and redirect_uri are required',
      });
    }

    // Validate credentials are configured
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Google Calendar credentials not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Google Calendar credentials not configured',
      });
    }

    // Exchange code for tokens
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google token exchange error:', errorData);
      return res.status(response.status).json({
        error: 'Token exchange failed',
        message: errorData.error_description || errorData.error || 'Failed to exchange code for token',
      });
    }

    const tokenData = await response.json();

    // Return tokens to client
    res.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error('Error in token exchange:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

// Health check endpoint
app.get('/api/google-calendar/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Google Calendar token exchange server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/google-calendar/health`);
});

module.exports = app;

