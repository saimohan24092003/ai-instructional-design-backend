import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import legacyEndpointsRouter from './src/routes/legacy-endpoints.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add the enhanced endpoints with GPT-4o-mini analysis
app.use('/api', legacyEndpointsRouter);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('🎓 Enhanced Professional Analysis System Started');
  console.log('');
  console.log('👩‍🏫 Expert: Dr. Elena Rodriguez, Ph.D. (20+ years experience)');
  console.log('🧠 AI Model: GPT-4o-mini with professional instructional design expertise');
  console.log('📊 Enhanced Features:');
  console.log('   ✅ Domain classification with detailed WHY explanations');
  console.log('   ✅ Dynamic complexity assessment based on actual content');
  console.log('   ✅ Expert scores with specific reasoning for each score');
  console.log('   ✅ Comprehensive gap analysis with actionable recommendations');
  console.log('   ✅ Content-specific SME questions (5-7 based on material)');
  console.log('   ✅ Professional justifications for all assessments');
  console.log('');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🔍 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('🚀 Ready for professional instructional design analysis!');
});