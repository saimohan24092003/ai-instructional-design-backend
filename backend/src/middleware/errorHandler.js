import { log } from '../utils/logger.js';

// Centralized error handler
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isOperational = Boolean(err.isOperational);

  log.error('Error:', {
    message: err.message,
    status,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(status).json({
    error: 'ServerError',
    message: isOperational ? err.message : 'An unexpected error occurred',
  });
}

export default errorHandler;


