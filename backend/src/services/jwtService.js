// services/jwtService.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Configuration
const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key';
const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

// Generate access token (short-lived)
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: 'access'
      },
      accessTokenSecret,
      {
        expiresIn: accessTokenExpiry,
        issuer: 'vireal-app',
        audience: 'vireal-users'
      }
    );
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

// Generate refresh token (long-lived)
const generateRefreshToken = (payload) => {
  try {
    const jti = crypto.randomUUID(); // Unique token ID
    
    return jwt.sign(
      {
        userId: payload.userId,
        type: 'refresh',
        jti
      },
      refreshTokenSecret,
      {
        expiresIn: refreshTokenExpiry,
        issuer: 'vireal-app',
        audience: 'vireal-users'
      }
    );
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

// Generate both tokens
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiry(accessTokenExpiry)
  };
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, accessTokenSecret, {
      issuer: 'vireal-app',
      audience: 'vireal-users'
    });
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw error;
    }
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, refreshTokenSecret, {
      issuer: 'vireal-app',
      audience: 'vireal-users'
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw error;
    }
  }
};

// Get token payload without verification (for expired tokens)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// Parse expiry time to seconds
const parseExpiry = (expiry) => {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1));
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 900; // 15 minutes default
  }
};

// Extract token from Authorization header
const extractTokenFromHeader = (authorization) => {
  if (!authorization) {
    return null;
  }
  
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Generate secure random token (for other purposes)
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Create password reset token
const generatePasswordResetToken = (userId) => {
  try {
    return jwt.sign(
      {
        userId,
        type: 'password-reset'
      },
      accessTokenSecret,
      {
        expiresIn: '1h',
        issuer: 'vireal-app',
        audience: 'vireal-users'
      }
    );
  } catch (error) {
    throw new Error('Failed to generate password reset token');
  }
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, accessTokenSecret, {
      issuer: 'vireal-app',
      audience: 'vireal-users'
    });
    
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      throw error;
    }
  }
};

// Create email verification token
const generateEmailVerificationToken = (userId, email) => {
  try {
    return jwt.sign(
      {
        userId,
        email,
        type: 'email-verification'
      },
      accessTokenSecret,
      {
        expiresIn: '24h',
        issuer: 'vireal-app',
        audience: 'vireal-users'
      }
    );
  } catch (error) {
    throw new Error('Failed to generate email verification token');
  }
};

// Verify email verification token
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, accessTokenSecret, {
      issuer: 'vireal-app',
      audience: 'vireal-users'
    });
    
    if (decoded.type !== 'email-verification') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Email verification token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid email verification token');
    } else {
      throw error;
    }
  }
};

// Export all functions as default
export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  parseExpiry,
  extractTokenFromHeader,
  generateSecureToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken
};