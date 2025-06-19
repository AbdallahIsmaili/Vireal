// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const API_BASE_URL = 'http://192.168.11.106:5000/api';

// Initialize Google Sign-In
export const initializeGoogleAuth = () => {
  GoogleSignin.configure({
    iosClientId: "335712244865-i5vg0uhlveafen1b9ugtg4vhkk77a2r6.apps.googleusercontent.com",
    webClientId: "335712244865-7odhk96ad2obueluerqmih3tfh8ddg5h.apps.googleusercontent.com", // This is crucial for getting idToken
    profileImageSize: 150,
    offlineAccess: false, // Set to false if you only need idToken, not refresh token
    forceCodeForRefreshToken: false, // Set to false to get idToken instead of serverAuthCode
    requestIdToken: true, // Explicitly request ID token
    requestEmail: true, // Request email access
    requestProfile: true, // Request profile access
  });
};

// Validate JWT token structure
export const isValidToken = (token) => {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Get user data from token
export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userData = await AsyncStorage.getItem('user');
    
    if (!token || !userData) return false;
    
    if (!isValidToken(token)) {
      await clearLocalAuth();
      return false;
    }
    
    // Optional: Check if Google session is still valid if signed in with Google
    const user = JSON.parse(userData);
    if (user.provider === 'google') {
      const isGoogleSignedIn = await GoogleSignin.isSignedIn();
      if (!isGoogleSignedIn) {
        await clearLocalAuth();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    await clearLocalAuth();
    return false;
  }
};

// Get stored user data
export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (userData && accessToken) {
      return {
        ...JSON.parse(userData),
        token: accessToken,
        refreshToken
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

// Store user data and tokens
export const storeAuthData = async (data) => {
  try {
    const { user, accessToken, refreshToken } = data;
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

// Clear local authentication data
export const clearLocalAuth = async () => {
  try {
    await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
  } catch (error) {
    console.error('Error clearing local auth:', error);
  }
};

// Sign out completely
export const signOut = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (userData) {
      const user = JSON.parse(userData);
      
      if (user.provider === 'google') {
        await GoogleSignin.signOut();
      }
      
      await fetch(`${API_BASE_URL}/auth/sign-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allDevices: true
        })
      });
    }
    
    await clearLocalAuth();
  } catch (error) {
    console.error('Error during sign out:', error);
    await clearLocalAuth();
    throw error;
  }
};

// Authenticate with backend
export const authenticateWithBackend = async (provider, credentials) => {
  try {
    if (!credentials) {
      throw new Error('Credentials are required');
    }

    console.log('Authenticating with backend:', { provider, hasCredentials: !!credentials });

    let endpoint;
    let body;
    
    switch (provider) {
      case 'google':
        // For Google, we specifically need idToken
        if (!credentials.idToken) {
          throw new Error('Google ID token is required');
        }
        
        endpoint = '/auth/google';
        body = {
          idToken: credentials.idToken, // Only send idToken
          userData: {
            name: credentials.user?.name || 'User',
            email: credentials.user?.email,
            photo: credentials.user?.photo || null
          }
        };
        
        if (!body.userData.email) {
          throw new Error('Email is required for Google authentication');
        }
        break;
        
      default:
        throw new Error('Unsupported provider');
    }
    
    console.log('Sending authentication request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request body:', { ...body, idToken: body.idToken ? '[REDACTED]' : undefined });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error response:', errorData);
      throw new Error(errorData.message || 'Authentication failed');
    }

    const result = await response.json();
    console.log('Backend success response:', { success: result.success, hasUser: !!result.data?.user });
    
    if (!result.success) {
      throw new Error(result.message || 'Authentication failed');
    }
    
    await storeAuthData({
      user: result.data.user,
      accessToken: result.data.tokens.accessToken,
      refreshToken: result.data.tokens.refreshToken
    });
    
    return result.data;
  } catch (error) {
    console.error('Backend authentication error:', error);
    throw error;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Token refresh failed');
    }
    
    await AsyncStorage.setItem('accessToken', result.data.tokens.accessToken);
    if (result.data.tokens.refreshToken) {
      await AsyncStorage.setItem('refreshToken', result.data.tokens.refreshToken);
    }
    
    return result.data.tokens;
  } catch (error) {
    console.error('Token refresh error:', error);
    await clearLocalAuth();
    throw error;
  }
};

// Validate token with backend
export const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No token available');
    
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Get auth headers for API requests
export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No auth token found');
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw error;
  }
};

// Make authenticated API request with automatic token refresh
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (response.status === 401) {
      try {
        const tokens = await refreshToken();
        const newHeaders = await getAuthHeaders();
        
        return await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers
          }
        });
      } catch (refreshError) {
        await clearLocalAuth();
        throw new Error('Session expired, please sign in again');
      }
    }

    return response;
  } catch (error) {
    console.error('Authenticated request error:', error);
    throw error;
  }
};