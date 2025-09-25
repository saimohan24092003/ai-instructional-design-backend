import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const router = express.Router();

// Helper function to generate JWT token
function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider
    },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Initiating Google OAuth');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${env.frontendUrl}/login?error=google_auth_failed` }),
  (req, res) => {
    try {
      const token = generateJWT(req.user);
      console.log('Google OAuth successful', { userId: req.user.id, email: req.user.email });
      
      // Redirect to frontend with token
      res.redirect(`${env.frontendUrl}/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      console.error('Error generating JWT after Google OAuth', error);
      res.redirect(`${env.frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// Microsoft OAuth routes
router.get('/microsoft', (req, res, next) => {
  console.log('Initiating Microsoft OAuth');
  passport.authenticate('microsoft', {
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${env.frontendUrl}/login?error=microsoft_auth_failed` }),
  (req, res) => {
    try {
      const token = generateJWT(req.user);
      console.log('Microsoft OAuth successful', { userId: req.user.id, email: req.user.email });
      
      // Redirect to frontend with token
      res.redirect(`${env.frontendUrl}/auth/callback?token=${token}&provider=microsoft`);
    } catch (error) {
      console.error('Error generating JWT after Microsoft OAuth', error);
      res.redirect(`${env.frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// JWT verification endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error', err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

export default router;
