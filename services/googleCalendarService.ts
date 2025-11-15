import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Google Calendar API Configuration
const getGoogleCalendarConfig = () => {
  const config = Constants?.expoConfig?.extra || {};
  return {
    clientId: config.googleCalendarClientId || process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || '',
    environment: config.googleCalendarEnvironment || 'production',
    backendUrl: config.googleCalendarBackendUrl || process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_BACKEND_URL || '',
  };
};

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleCalendarListResponse {
  items: Array<{
    id: string;
    summary: string;
    primary?: boolean;
  }>;
}

interface GoogleCalendarEventsResponse {
  items: Array<{
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
  }>;
}

const TOKEN_STORAGE_KEY = '@google_calendar_access_token';
const REFRESH_TOKEN_STORAGE_KEY = '@google_calendar_refresh_token';

/**
 * Get stored access token
 */
async function getStoredAccessToken(userId: string): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(`${TOKEN_STORAGE_KEY}_${userId}`);
    return token;
  } catch (error) {
    console.error('Error getting stored access token:', error);
    return null;
  }
}

/**
 * Store access token
 */
async function storeAccessToken(userId: string, token: string, refreshToken?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${TOKEN_STORAGE_KEY}_${userId}`, token);
    if (refreshToken) {
      await AsyncStorage.setItem(`${REFRESH_TOKEN_STORAGE_KEY}_${userId}`, refreshToken);
    }
  } catch (error) {
    console.error('Error storing access token:', error);
  }
}

/**
 * Clear stored tokens
 */
export async function clearGoogleCalendarTokens(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${TOKEN_STORAGE_KEY}_${userId}`);
    await AsyncStorage.removeItem(`${REFRESH_TOKEN_STORAGE_KEY}_${userId}`);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

/**
 * Authenticate with Google Calendar via OAuth
 */
export async function authenticateGoogleCalendar(userId: string): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  try {
    const config = getGoogleCalendarConfig();
    if (!config.clientId) {
      return { success: false, error: 'Google Calendar Client ID not configured' };
    }

    const redirectUri = Linking.createURL('/google-calendar-callback');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
    
    // Build OAuth URL
    const authUrl = `${GOOGLE_OAUTH_BASE}?` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open OAuth flow
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Extract authorization code from callback URL
      const urlParams = new URLSearchParams(result.url.split('?')[1] || '');
      const code = urlParams.get('code');

      if (code) {
        // Exchange code for access token
        const tokenResult = await exchangeCodeForToken(code, redirectUri);
        
        if (tokenResult.success && tokenResult.accessToken) {
          // Store tokens
          await storeAccessToken(userId, tokenResult.accessToken, tokenResult.refreshToken);
          return { success: true, accessToken: tokenResult.accessToken };
        }
        
        return { success: false, error: tokenResult.error || 'Failed to get access token' };
      }
    }

    return { success: false, error: 'Authentication cancelled or failed' };
  } catch (error: any) {
    console.error('Error authenticating Google Calendar:', error);
    return { success: false, error: error.message || 'Google Calendar authentication failed' };
  }
}

/**
 * Exchange authorization code for access token
 * 
 * ⚠️ IMPORTANT: Token exchange requires Client Secret which MUST be on backend
 * This function will fail without client_secret. You need to:
 * 1. Create a backend endpoint: POST /api/google-calendar/token
 * 2. Backend receives code, exchanges it with client_secret
 * 3. Backend returns access_token and refresh_token
 * 4. Update this function to call your backend endpoint
 */
async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{ success: boolean; accessToken?: string; refreshToken?: string; error?: string }> {
  try {
    const config = getGoogleCalendarConfig();
    
    // Check if backend URL is configured
    if (!config.backendUrl) {
      return {
        success: false,
        error: 'Backend URL not configured. Please set googleCalendarBackendUrl in app.json. See GOOGLE_CALENDAR_SETUP.md for details.',
      };
    }

    try {
      // Determine endpoint URL based on backend type
      // Supabase Edge Functions: https://project.supabase.co/functions/v1
      // Regular backend: https://your-backend.com
      const isSupabaseFunction = config.backendUrl.includes('supabase.co/functions');
      const endpointUrl = isSupabaseFunction
        ? `${config.backendUrl}/google-calendar-token`
        : `${config.backendUrl}/api/google-calendar/token`;

      // Call backend endpoint for token exchange
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || errorData.error || 'Token exchange failed',
        };
      }

      const tokenData = await response.json();
      
      return {
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      };
    } catch (fetchError: any) {
      console.error('Error calling backend token exchange:', fetchError);
      return {
        success: false,
        error: `Backend connection failed: ${fetchError.message || 'Unable to reach backend endpoint'}`,
      };
    }
  } catch (error: any) {
    console.error('Error exchanging code for token:', error);
    return { success: false, error: error.message || 'Token exchange failed' };
  }
}

/**
 * Get access token (from storage or refresh if needed)
 */
async function getAccessToken(userId: string): Promise<string | null> {
  // First, try to get from storage
  const storedToken = await getStoredAccessToken(userId);
  if (storedToken) {
    return storedToken;
  }
  
  return null;
}

/**
 * Get list of user's Google Calendars
 */
export async function getGoogleCalendarList(userId: string): Promise<{ success: boolean; calendars?: Array<{ id: string; summary: string; primary: boolean }>; error?: string }> {
  try {
    const accessToken = await getAccessToken(userId);
    if (!accessToken) {
      return { success: false, error: 'Not authenticated. Please connect your Google Calendar first.' };
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, need to re-authenticate
        await clearGoogleCalendarTokens(userId);
        return { success: false, error: 'Authentication expired. Please reconnect your Google Calendar.' };
      }
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }

    const data: GoogleCalendarListResponse = await response.json();
    
    const calendars = data.items.map(cal => ({
      id: cal.id,
      summary: cal.summary || 'Untitled Calendar',
      primary: cal.primary || false,
    }));

    return { success: true, calendars };
  } catch (error: any) {
    console.error('Error fetching Google Calendar list:', error);
    return { success: false, error: error.message || 'Failed to fetch calendars' };
  }
}

/**
 * Fetch Google Calendar events for a date range
 */
export async function fetchGoogleCalendarEvents(
  userId: string,
  calendarId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; events?: Array<any>; error?: string }> {
  try {
    const accessToken = await getAccessToken(userId);
    if (!accessToken) {
      return { success: false, error: 'Not authenticated. Please connect your Google Calendar first.' };
    }

    // Format dates for Google Calendar API (RFC3339 format)
    const timeMin = `${startDate}T00:00:00Z`;
    const timeMax = `${endDate}T23:59:59Z`;

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?` +
      `timeMin=${timeMin}&` +
      `timeMax=${timeMax}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        await clearGoogleCalendarTokens(userId);
        return { success: false, error: 'Authentication expired. Please reconnect your Google Calendar.' };
      }
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data: GoogleCalendarEventsResponse = await response.json();
    
    const events = data.items.map(event => ({
      id: event.id,
      summary: event.summary || 'Untitled Event',
      start: event.start,
      end: event.end,
      allDay: !!event.start.date, // All-day events use date instead of dateTime
    }));

    return { success: true, events };
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    return { success: false, error: error.message || 'Failed to fetch events' };
  }
}

/**
 * Check if user is authenticated with Google Calendar
 */
export async function isGoogleCalendarAuthenticated(userId: string): Promise<boolean> {
  const token = await getAccessToken(userId);
  return !!token;
}

