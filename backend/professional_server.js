#!/usr/bin/env node

/**
 * Professional Analysis Server
 * Entry point for Dr. Sarah Mitchell's Professional Analysis System
 */

import app from './src/app.js';
import { env } from './src/config/env.js';

const port = normalizePort(process.env.PORT || env.port || '3000');

// Create HTTP server
const server = app.listen(port, '0.0.0.0', () => {
  console.log('🎓 Dr. Sarah Mitchell Professional Analysis System Started');
  console.log('');
  console.log('👩‍🏫 Expert Instructional Designer: Dr. Sarah Mitchell, Ph.D.');
  console.log('🎯 Experience: 25+ years in instructional design');
  console.log('📊 Professional Analysis: Content domain classification, quality assessment, gap analysis');
  console.log('❓ SME Questions: Content-specific questions tailored to each domain');
  console.log('🔍 Suitability Assessment: GREEN/YELLOW/RED classification with detailed reasoning');
  console.log('💡 Enhancement Suggestions: Actionable recommendations for content improvement');
  console.log('');
  console.log(`🌐 Professional Analysis Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
  console.log(`📤 Upload endpoint: http://localhost:${port}/api/content/upload-and-analyze`);
  console.log(`📊 Status endpoint: http://localhost:${port}/api/content/analysis-status/:sessionId`);
  console.log('');
  console.log('🚀 Ready for professional instructional design analysis!');
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('❌ ' + bind + ' is already in use');
      console.log('💡 Try using a different port by updating your .env file');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('✅ Professional Analysis System listening on ' + bind);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down Dr. Sarah Mitchell Professional Analysis System...');
  server.close(() => {
    console.log('✅ Professional Analysis System shutdown complete');
    process.exit(0);
  });
});

export default server;