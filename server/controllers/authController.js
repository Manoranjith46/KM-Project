import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '15m';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = (req, maxAge = COOKIE_MAX_AGE) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const forwardedProto = req.headers['x-forwarded-proto'];
  const isHttps = req.secure || forwardedProto === 'https';

  // SameSite=None requires Secure=true in modern browsers.
  const secure = isProduction || isHttps;
  const sameSite = secure ? 'none' : 'lax';

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
    path: '/',
  };
};

const getClearCookieOptions = (req) => {
  const { httpOnly, secure, sameSite, path } = getCookieOptions(req);
  return { httpOnly, secure, sameSite, path };
};

// Generate ACCESS token (short-lived)
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
};

// Generate REFRESH token (long-lived)
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

// Set cookies helper
const setTokenCookies = (req, res, accessToken, refreshToken) => {
  const cookieOptions = getCookieOptions(req);

  // Access token cookie - maxAge matches refresh token so the browser keeps it.
  // The JWT's own expiry (15m) controls access; the cookie must survive for refresh to work.
  res.cookie('accessToken', accessToken, cookieOptions);

  // Refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // Validate input
    if (!mobileNumber || !password) {
      return res.status(400).json({ message: 'Please provide mobile number and password' });
    }

    // Find user by mobile number (include password for comparison)
    const user = await User.findOne({ mobileNumber }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }

    // Generate both tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Set cookies
    setTokenCookies(req, res, accessToken, refreshToken);

    // Return user data (excluding password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Logout user
export const logoutUser = (req, res) => {
  try {
    const clearOptions = getClearCookieOptions(req);
    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.id, decoded.role);

      // Set new access token cookie
      res.cookie('accessToken', newAccessToken, getCookieOptions(req));

      res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Refresh token has expired - user must login again
        res.clearCookie('refreshToken', getClearCookieOptions(req));
        return res.status(403).json({ message: 'Refresh token expired. Please login again.' });
      }
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error refreshing token' });
  }
};

// Get current user (protected route example)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

export default { loginUser, logoutUser, refreshAccessToken, getCurrentUser };
