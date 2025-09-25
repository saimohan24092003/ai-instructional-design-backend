import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import ProfessionalContentAnalyzer from '../services/professionalContentAnalyzer.js';
import AdaptiveLearningMapGenerator from '../services/adaptiveLearningMapGenerator.js';

const router = express.Router();
const contentAnalyzer = new ProfessionalContentAnalyzer();
const learningMapGenerator = new AdaptiveLearningMapGenerator();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/content';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueId}-${Date.now()}${fileExtension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime',
      'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.scorm')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// Simple session storage (in production, use database)
const uploadSessions = new Map();

// Extract content from uploaded files
async function extractFileContent(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    let content = '';
    let metadata = {
      fileType: ext,
      originalSize: file.size,
      extractionMethod: 'unknown'
    };

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
      metadata.extractionMethod = 'PDF Parser';
      metadata.pages = pdfData.numpages;
    } else if (ext === '.docx' || ext === '.doc') {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      content = result.value;
      metadata.extractionMethod = 'Mammoth DOCX Parser';
    } else if (ext === '.txt') {
      content = fs.readFileSync(file.path, 'utf8');
      metadata.extractionMethod = 'Direct Text Read';
    } else {
      // For other file types, create a description for analysis
      content = `File: ${file.originalname} (${file.mimetype}) - Content extraction pending professional analysis`;
      metadata.extractionMethod = 'File Description';
    }

    return {
      content: content || 'No extractable content found',
      metadata,
      extracted: content.length > 0
    };

  } catch (error) {
    console.error(`Content extraction error for ${file.originalname}:`, error);
    return {
      content: `Error extracting content from ${file.originalname}. File may be corrupted or in unsupported format.`,
      metadata: { extractionError: error.message },
      extracted: false
    };
  }
}

// Upload and analyze endpoint with professional analysis
router.post('/upload-and-analyze', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded for professional analysis'
      });
    }

    console.log(`🎓 Dr. Sarah Mitchell analyzing ${req.files.length} uploaded files`);

    // Create session for tracking this upload batch
    const sessionId = uuidv4();

    // Extract content from all files
    const contentData = [];
    for (const file of req.files) {
      console.log(`📄 Extracting content from: ${file.originalname}`);
      const extractedContent = await extractFileContent(file);

      contentData.push({
        fileName: file.originalname,
        content: extractedContent.content,
        metadata: extractedContent.metadata,
        fileInfo: {
          id: uuidv4(),
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        }
      });
    }

    const uploadSession = {
      sessionId,
      uploadedAt: new Date().toISOString(),
      files: contentData.map(d => d.fileInfo),
      contentData,
      status: 'analyzing',
      analysisProgress: 25,
      currentStep: 'content_extracted'
    };

    // Store session data
    uploadSessions.set(sessionId, uploadSession);

    // Send immediate response
    res.json({
      success: true,
      message: `Dr. Sarah Mitchell is analyzing ${req.files.length} files with professional expertise`,
      data: {
        sessionId,
        filesUploaded: req.files.length,
        files: uploadSession.files.map(f => ({
          id: f.id,
          name: f.originalName,
          size: f.size,
          type: f.mimetype
        })),
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        analysisStatus: "Content extracted, professional analysis in progress"
      }
    });

    // Perform professional content analysis in background
    try {
      console.log(`🔍 Starting professional instructional design analysis...`);

      // Update progress
      uploadSession.status = 'analyzing';
      uploadSession.analysisProgress = 50;
      uploadSession.currentStep = 'domain_classification';

      // Perform the AI analysis
      const professionalAnalysis = await contentAnalyzer.analyzeContent(contentData, sessionId);

      // Generate content-specific SME questions
      const smeQuestions = await contentAnalyzer.generateContentSpecificSMEQuestions(
        professionalAnalysis,
        sessionId
      );

      // Update session with analysis results
      uploadSession.status = 'completed';
      uploadSession.analysisProgress = 100;
      uploadSession.currentStep = 'analysis_complete';
      uploadSession.completedAt = new Date().toISOString();
      uploadSession.professionalAnalysis = professionalAnalysis;
      uploadSession.contentSpecificSMEQuestions = smeQuestions;

      uploadSession.analysisResults = {
        domainClassified: professionalAnalysis.domainClassification.primaryDomain,
        complexityLevel: professionalAnalysis.complexityAssessment.level,
        qualityScore: professionalAnalysis.qualityAssessment.overallScore,
        suitabilityLevel: professionalAnalysis.suitabilityAssessment.level,
        suitabilityColor: professionalAnalysis.suitabilityAssessment.colorCode,
        gapsIdentified: professionalAnalysis.gapAnalysis.identifiedGaps.length,
        enhancementsRecommended: professionalAnalysis.enhancementSuggestions.length,
        smeQuestionsGenerated: smeQuestions.length,
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        professionalGrade: true
      };

      console.log(`✅ Professional analysis completed for session ${sessionId}`);
      console.log(`   📊 Domain: ${professionalAnalysis.domainClassification.primaryDomain}`);
      console.log(`   📈 Quality: ${professionalAnalysis.qualityAssessment.overallScore}%`);
      console.log(`   🎯 Suitability: ${professionalAnalysis.suitabilityAssessment.level} (${professionalAnalysis.suitabilityAssessment.colorCode})`);
      console.log(`   🔍 Gaps: ${professionalAnalysis.gapAnalysis.identifiedGaps.length}`);

    } catch (analysisError) {
      console.error('❌ Professional analysis failed:', analysisError);
      uploadSession.status = 'error';
      uploadSession.analysisProgress = 0;
      uploadSession.currentStep = 'analysis_failed';
      uploadSession.errorMessage = `Professional analysis failed: ${analysisError.message}`;
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Professional content analysis failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get analysis status with detailed professional results
router.get('/analysis-status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Analysis session not found'
      });
    }

    const response = {
      success: true,
      data: {
        sessionId,
        status: session.status,
        filesCount: session.files.length,
        analysisProgress: session.analysisProgress || 0,
        currentStep: session.currentStep || 'waiting',
        completedAt: session.completedAt || null,
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        analysisResults: session.analysisResults || null
      }
    };

    // Include detailed professional analysis if completed
    if (session.status === 'completed' && session.professionalAnalysis) {
      response.data.professionalAnalysis = {
        domainClassification: {
          primaryDomain: session.professionalAnalysis.domainClassification.primaryDomain,
          confidence: session.professionalAnalysis.domainClassification.confidence,
          reasoning: session.professionalAnalysis.domainClassification.reasoning,
          subDomain: session.professionalAnalysis.domainClassification.subDomain,
          contentType: session.professionalAnalysis.domainClassification.contentType
        },
        complexityAssessment: {
          level: session.professionalAnalysis.complexityAssessment.level,
          reasoning: session.professionalAnalysis.complexityAssessment.reasoning,
          prerequisites: session.professionalAnalysis.complexityAssessment.prerequisites,
          cognitiveLoad: session.professionalAnalysis.complexityAssessment.cognitiveLoad
        },
        qualityAssessment: {
          overallScore: session.professionalAnalysis.qualityAssessment.overallScore,
          clarityScore: session.professionalAnalysis.qualityAssessment.clarityScore,
          clarityJustification: session.professionalAnalysis.qualityAssessment.clarityJustification,
          completenessScore: session.professionalAnalysis.qualityAssessment.completenessScore,
          completenessJustification: session.professionalAnalysis.qualityAssessment.completenessJustification,
          engagementScore: session.professionalAnalysis.qualityAssessment.engagementScore,
          engagementJustification: session.professionalAnalysis.qualityAssessment.engagementJustification,
          currencyScore: session.professionalAnalysis.qualityAssessment.currencyScore,
          currencyJustification: session.professionalAnalysis.qualityAssessment.currencyJustification
        },
        suitabilityAssessment: {
          score: session.professionalAnalysis.suitabilityAssessment.score,
          level: session.professionalAnalysis.suitabilityAssessment.level,
          colorCode: session.professionalAnalysis.suitabilityAssessment.colorCode,
          recommendation: session.professionalAnalysis.suitabilityAssessment.recommendation,
          reasoning: session.professionalAnalysis.suitabilityAssessment.reasoning
        },
        gapAnalysis: {
          totalGaps: session.professionalAnalysis.gapAnalysis.totalGaps,
          severity: session.professionalAnalysis.gapAnalysis.severity,
          identifiedGaps: session.professionalAnalysis.gapAnalysis.identifiedGaps.map(gap => ({
            type: gap.type,
            severity: gap.severity,
            description: gap.description,
            recommendation: gap.recommendation
          })),
          recommendations: session.professionalAnalysis.gapAnalysis.recommendations
        },
        enhancementSuggestions: session.professionalAnalysis.enhancementSuggestions.map(suggestion => ({
          type: suggestion.type,
          description: suggestion.description,
          priority: suggestion.priority
        })),
        professionalRecommendations: session.professionalAnalysis.professionalRecommendations
      };

      // Include content-specific SME questions
      response.data.contentSpecificSMEQuestions = session.contentSpecificSMEQuestions || [];

      // Add metadata
      response.data.metadata = session.professionalAnalysis.metadata;
    }

    // Include error information if analysis failed
    if (session.status === 'error') {
      response.data.errorMessage = session.errorMessage;
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Analysis status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve professional analysis results',
      error: error.message
    });
  }
});

// Get detailed professional analysis endpoint
router.get('/professional-analysis/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Analysis session not found'
      });
    }

    if (session.status !== 'completed' || !session.professionalAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Professional analysis not yet completed',
        status: session.status
      });
    }

    res.json({
      success: true,
      message: 'Comprehensive professional instructional design analysis',
      data: {
        sessionId,
        analyst: "Dr. Sarah Mitchell, Ph.D. - Expert Instructional Designer",
        analysisCompletedAt: session.completedAt,
        fullAnalysis: session.professionalAnalysis,
        contentSpecificSMEQuestions: session.contentSpecificSMEQuestions,
        rawAnalysisResponse: session.professionalAnalysis.rawResponse,
        implementationReady: true
      }
    });

  } catch (error) {
    console.error('❌ Detailed analysis retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve detailed professional analysis',
      error: error.message
    });
  }
});

// Generate adaptive learning map from analysis
router.post('/generate-learning-map/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { strategy } = req.body; // Optional strategy preferences from user

    console.log(`🎯 Generating adaptive learning map for session: ${sessionId}`);

    // Get the session data
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'completed' || !session.professionalAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Content analysis must be completed before generating learning map',
        currentStatus: session.status
      });
    }

    // Get SME responses if available
    const smeResponses = session.smeResponses?.answers || [];

    // Pass complete data to learning map generator
    const learningMap = await learningMapGenerator.generateAdaptiveLearningMap(
      session.professionalAnalysis,
      strategy || {},
      smeResponses,
      {
        sessionId: sessionId,
        contentData: session.contentData || [],
        files: session.files || []
      }
    );

    // Store learning map in session
    session.learningMap = learningMap;
    session.learningMapGeneratedAt = new Date().toISOString();

    console.log(`✅ Learning map generated successfully for session ${sessionId}`);
    console.log(`   📚 Course: ${learningMap.courseName}`);
    console.log(`   ⏱️ Duration: ${learningMap.totalDuration} minutes`);
    console.log(`   📖 Modules: ${learningMap.modules.length}`);

    res.json({
      success: true,
      message: 'Adaptive learning map generated successfully',
      data: {
        sessionId,
        learningMap,
        generatedAt: session.learningMapGeneratedAt,
        strategy: learningMap.metadata.strategy,
        contentProfile: learningMap.metadata.contentProfile
      }
    });

  } catch (error) {
    console.error('❌ Learning map generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate adaptive learning map',
      error: error.message
    });
  }
});

// Get learning map for a session
router.get('/learning-map/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.learningMap) {
      return res.status(404).json({
        success: false,
        message: 'Learning map not yet generated for this session',
        suggestion: `POST /api/content/generate-learning-map/${sessionId}`
      });
    }

    res.json({
      success: true,
      message: 'Learning map retrieved successfully',
      data: {
        sessionId,
        learningMap: session.learningMap,
        generatedAt: session.learningMapGeneratedAt,
        analysisCompletedAt: session.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Learning map retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve learning map',
      error: error.message
    });
  }
});

// TEST ENDPOINT - Generate learning map with mock data for immediate testing
router.post('/test-learning-map', async (req, res) => {
  try {
    const { strategy } = req.body;

    console.log('🧪 Generating TEST learning map with strategy:', strategy?.learningApproach || 'adaptive');

    // Create mock professional analysis data
    const mockAnalysis = {
      domainClassification: {
        primaryDomain: 'Business & Management',
        confidence: 85,
        reasoning: 'Content focuses on leadership and team management principles'
      },
      complexityAssessment: {
        level: 'Intermediate',
        reasoning: 'Requires practical experience and management understanding'
      },
      qualityAssessment: {
        overallScore: 82,
        clarityScore: 85,
        completenessScore: 78,
        engagementScore: 84,
        currencyScore: 81
      },
      metadata: {
        contentFilesAnalyzed: 1,
        totalContentLength: 12500 // Roughly 15 pages
      }
    };

    const mockSessionData = {
      contentData: [
        {
          fileName: 'Leadership_Training_Manual.pdf',
          metadata: { pages: 15 }
        }
      ]
    };

    // Generate learning map using our adaptive generator
    const learningMap = await learningMapGenerator.generateAdaptiveLearningMap(
      mockAnalysis,
      strategy || { learningApproach: 'adaptive' },
      [], // No SME responses for test
      mockSessionData
    );

    console.log('✅ TEST learning map generated successfully');

    res.json({
      success: true,
      message: 'TEST learning map generated with mock data',
      data: {
        learningMap,
        testMode: true,
        strategy: strategy?.learningApproach || 'adaptive'
      }
    });

  } catch (error) {
    console.error('❌ TEST learning map generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'TEST learning map generation failed',
      error: error.message
    });
  }
});

// Store approved content suggestions
router.post('/store-suggestions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { approvedSuggestions, userNotes } = req.body;

    const session = uploadSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Store approved suggestions
    session.approvedSuggestions = {
      suggestions: approvedSuggestions || [],
      userNotes: userNotes || '',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Content Manager'
    };

    console.log(`✅ Stored ${approvedSuggestions?.length || 0} approved suggestions for session ${sessionId}`);

    res.json({
      success: true,
      message: 'Content suggestions stored successfully',
      data: {
        sessionId,
        suggestionsStored: approvedSuggestions?.length || 0,
        storedAt: session.approvedSuggestions.approvedAt
      }
    });

  } catch (error) {
    console.error('❌ Error storing suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store content suggestions',
      error: error.message
    });
  }
});

// Store SME answers
router.post('/store-sme-answers/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { smeAnswers, completedAt } = req.body;

    const session = uploadSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Store SME answers
    session.smeResponses = {
      answers: smeAnswers || [],
      completedAt: completedAt || new Date().toISOString(),
      totalQuestions: session.contentSpecificSMEQuestions?.length || 0,
      answeredQuestions: smeAnswers?.length || 0
    };

    console.log(`✅ Stored SME answers for session ${sessionId}: ${smeAnswers?.length || 0} answers`);

    res.json({
      success: true,
      message: 'SME answers stored successfully',
      data: {
        sessionId,
        answersStored: smeAnswers?.length || 0,
        totalQuestions: session.smeResponses.totalQuestions,
        completionRate: session.smeResponses.totalQuestions > 0
          ? Math.round((session.smeResponses.answeredQuestions / session.smeResponses.totalQuestions) * 100)
          : 0,
        storedAt: session.smeResponses.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Error storing SME answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store SME answers',
      error: error.message
    });
  }
});

// Get stored data for a session (suggestions and SME answers)
router.get('/session-data/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session data retrieved successfully',
      data: {
        sessionId,
        hasApprovedSuggestions: !!session.approvedSuggestions,
        hasSMEAnswers: !!session.smeResponses,
        approvedSuggestions: session.approvedSuggestions || null,
        smeResponses: session.smeResponses || null,
        professionalAnalysis: session.professionalAnalysis ? {
          domain: session.professionalAnalysis.domainClassification.primaryDomain,
          complexity: session.professionalAnalysis.complexityAssessment.level,
          qualityScore: session.professionalAnalysis.qualityAssessment.overallScore
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving session data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session data',
      error: error.message
    });
  }
});

// DEBUG: Test analysis with sample content
router.post('/test-analysis', async (req, res) => {
  try {
    const sampleContent = [{
      fileName: 'test-content.txt',
      content: 'This is a healthcare training manual about patient safety and infection control procedures. It covers hand hygiene, PPE usage, and isolation precautions for healthcare professionals.',
      metadata: { fileType: '.txt', extractionMethod: 'Direct Text Read' },
      fileInfo: { id: 'test-123', originalName: 'test-content.txt' }
    }];

    console.log('🧪 Testing analysis with sample content');

    const analysis = await contentAnalyzer.analyzeContent(sampleContent, 'test-session');

    res.json({
      success: true,
      message: 'Test analysis completed',
      data: analysis
    });

  } catch (error) {
    console.error('❌ Test analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test analysis failed',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
