import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import User from "../models/User.js";
import jwtService from "../services/jwtService.js";

export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign In
export const googleSignIn = async (req, res) => {
  try {
    const { idToken, userData } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication token is required'
      });
    }

    let payload;
    try {
      // First try to verify as ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (idTokenError) {
      // If that fails, try as auth code
      try {
        const { tokens } = await googleClient.getToken(idToken);
        if (!tokens.id_token) {
          throw new Error('No ID token received from auth code exchange');
        }
        const ticket = await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (authCodeError) {
        console.error('Both ID token and auth code verification failed:', authCodeError);
        throw new Error('Invalid Google authentication token');
      }
    }

    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is required'
      });
    }

    const email = payload.email;
    const name = userData?.name || payload.name || email.split('@')[0];
    const picture = payload.picture;

    // Generate username (email prefix + random 4 digits)
    const usernameBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const username = `${usernameBase}${randomDigits}`.slice(0, 20);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        username,
        email,
        name,
        authProvider: 'google',
        avatar: picture,
        bio: '',
        level: 1,
        xp: 0,
        nextLevelXP: 1000,
        followers: 0,
        following: 0,
        settings: {
          theme: 'auto',
          notificationsEnabled: true,
          language: 'en'
        }
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Google sign in successful',
      data: {
        user: user.toSafeObject(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Google Sign In Error:', error);
    
    let statusCode = 500;
    let message = 'Google sign in failed';
    
    if (error.message.includes('Invalid token')) {
      statusCode = 401;
      message = 'Invalid Google token';
    } else if (error.message.includes('required')) {
      statusCode = 400;
      message = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Facebook Sign In
export const facebookSignIn = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token is required'
      });
    }

    // Verify Facebook token
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
    );

    const fbData = fbResponse.data;
    const facebookId = fbData.id;
    const email = fbData.email || `facebook_${facebookId}@vireal.com`;
    const name = fbData.name;
    const picture = fbData.picture?.data?.url;

    // Generate username
    const usernameBase = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const username = `${usernameBase}${randomDigits}`.slice(0, 20);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        username,
        email,
        authProvider: 'facebook',
        avatar: picture,
        bio: '',
        level: 1,
        xp: 0,
        nextLevelXP: 1000,
        followers: 0,
        following: 0,
        settings: {
          theme: 'auto',
          notificationsEnabled: true,
          language: 'en'
        }
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Facebook sign in successful',
      data: {
        user: user.toSafeObject(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Facebook Sign In Error:', error);
    
    if (error.response?.status === 400) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Facebook token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Facebook sign in failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Apple Sign In
export const appleSignIn = async (req, res) => {
  try {
    const { idToken, userData } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Apple ID token is required'
      });
    }

    const decodedToken = jwtService.decodeToken(idToken);
    
    if (!decodedToken || !decodedToken.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Apple token'
      });
    }

    const appleId = decodedToken.sub;
    const email = decodedToken.email || `apple_${appleId}@vireal.com`;
    const name = userData?.name || 'Apple User';

    // Generate username
    const usernameBase = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const username = `${usernameBase}${randomDigits}`.slice(0, 20);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        username,
        email,
        authProvider: 'apple',
        avatar: 'https://cdn.vireal.com/default-avatar.png',
        bio: '',
        level: 1,
        xp: 0,
        nextLevelXP: 1000,
        followers: 0,
        following: 0,
        settings: {
          theme: 'auto',
          notificationsEnabled: true,
          language: 'en'
        }
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Apple sign in successful',
      data: {
        user: user.toSafeObject(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Apple Sign In Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Apple sign in failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new token pair
    const tokenPayload = {
      userId: user._id,
      email: user.email
    };

    const tokens = jwtService.generateTokenPair(tokenPayload);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(tokens.refreshToken, req.get('User-Agent') || '');

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Refresh Token Error:', error);
    
    if (error.message.includes('expired') || error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sign Out
export const signOut = async (req, res) => {
  try {
    const { refreshToken, allDevices } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (allDevices) {
      // Remove all refresh tokens (sign out from all devices)
      await user.removeAllRefreshTokens();
    } else if (refreshToken) {
      // Remove specific refresh token
      await user.removeRefreshToken(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Sign Out Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Sign out failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get Current User Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Validate Token
export const validateToken = async (req, res) => {
  try {
    // If middleware passed, token is valid
    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Token Validation Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Token validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  googleSignIn,
  facebookSignIn,
  appleSignIn,
  refreshToken,
  signOut,
  getCurrentUser,
  validateToken
};