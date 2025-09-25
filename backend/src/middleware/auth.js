import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload; // attach decoded user
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export default authenticateJwt;


