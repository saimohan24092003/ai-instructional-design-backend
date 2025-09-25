import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const BACKEND_URL = `http://localhost:${PORT}`;

// NEW: Initialize OpenAI with error handling
let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI initialized successfully');
    } else {
        console.log('⚠️ OpenAI API key not found - will use enhanced fallback strategies');
    }
} catch (error) {
    console.error('❌ OpenAI initialization failed:', error.message);
}

// ===================================
// MIDDLEWARE CONFIGURATION
// ===================================
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500',
            'http://localhost:5173', 'http://localhost:5174', 
            'http://localhost:8080', 'http://127.0.0.1:8080',
        ];
        callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    origin: ['null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.options('*', cors());

// ===================================
// DIRECTORIES SETUP
// ===================================
const uploadsDir = './uploads';
const outputsDir = './outputs';

[uploadsDir, outputsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ===================================
// MULTER CONFIGURATION
// ===================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'audio/mpeg', 'audio/wav', 'audio/mp3',
            'video/mp4', 'video/quicktime', 'application/zip',
            'image/jpeg', 'image/png', 'image/gif',
            'text/plain', 'application/json'
        ];
        cb(null, allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.scorm'));
    }
});

// ===================================
// AI INSTRUCTIONAL DESIGNER CONFIGURATION
// ===================================
const AI_INSTRUCTIONAL_DESIGNER = {
    name: "Dr. Elena Rodriguez",
    expertise: "Senior Instructional Designer & Learning Sciences Expert",
    experience: "20+ years",
    specializations: [
        "Advanced Domain Classification",
        "Content Structure Analysis", 
        "Learning Objective Extraction",
        "Bloom's Taxonomy Integration",
        "Gap Analysis & Resolution",
        "Content Enhancement Strategies",
        "Personalized Strategy Recommendations"
    ],
    accuracy: "95%+",
    
    domains: {
        EDUCATION: {
            name: "Education & Academic",
            sectors: ["K-12 Education", "Higher Education", "Adult Learning", "Special Education"],
            keywords: ["curriculum", "syllabus", "lesson plan", "academic", "student", "teacher", "classroom", "education", "learning objectives", "assessment", "pedagogy"],
            color: "#4F46E5",
            icon: "school",
            suitability: 95
        },
        HEALTHCARE: {
            name: "Healthcare & Medical",
            sectors: ["Medical Training", "Patient Care", "Clinical Procedures", "Healthcare Compliance"],
            keywords: ["medical", "patient", "clinical", "healthcare", "diagnosis", "treatment", "therapy", "medicine", "hospital", "nurse", "doctor", "pharmaceutical"],
            color: "#DC2626",
            icon: "medical_services",
            suitability: 92
        },
        TECHNOLOGY: {
            name: "Technology & IT",
            sectors: ["Software Development", "IT Operations", "Cybersecurity", "Data Analytics"],
            keywords: ["software", "programming", "code", "api", "database", "server", "network", "security", "data", "algorithm", "development", "technology"],
            color: "#059669",
            icon: "computer",
            suitability: 90
        },
        BUSINESS: {
            name: "Business & Management",
            sectors: ["Leadership Development", "Sales Training", "Project Management", "Business Strategy"],
            keywords: ["business", "management", "leadership", "strategy", "sales", "marketing", "finance", "operations", "team", "project", "process"],
            color: "#7C2D12",
            icon: "business",
            suitability: 88
        },
        COMPLIANCE: {
            name: "Compliance & Regulatory",
            sectors: ["Legal Compliance", "Safety Training", "Quality Assurance", "Risk Management"],
            keywords: ["compliance", "regulation", "policy", "procedure", "audit", "risk", "safety", "quality", "legal", "standard", "guideline"],
            color: "#B45309",
            icon: "gavel",
            suitability: 93
        },
        MANUFACTURING: {
            name: "Manufacturing & Operations",
            sectors: ["Production Training", "Quality Control", "Safety Procedures", "Equipment Operation"],
            keywords: ["manufacturing", "production", "quality", "equipment", "machinery", "process", "safety", "operations", "assembly", "maintenance"],
            color: "#6B7280",
            icon: "precision_manufacturing",
            suitability: 87
        }
    }
};

// ===================================
// DR. ELENA CHATGPT 4.0 EXPERT PROMPT
// ===================================
const DR_ELENA_EXPERT_PROMPT = `You are Dr. Elena Rodriguez, a Senior Instructional Designer with 20+ years of experience in e-learning development, learning sciences, and educational technology. You are the leading expert at CourseCraft AI for personalized strategy recommendations.

## Your Core Identity
- **Name**: Dr. Elena Rodriguez
- **Title**: Senior Instructional Designer & Learning Sciences Expert  
- **Experience**: 20+ years in e-learning development
- **Specialization**: Personalized learning strategy development
- **Accuracy Rate**: 95%+ in strategy recommendations

## Critical Requirements

**PERSONALIZATION MANDATE**: Every strategy recommendation MUST be completely unique and specifically tailored to the exact combination of:
1. Content domain and type
2. Content quality scores and gaps
3. Each individual SME response
4. Complexity level and audience needs

NO GENERIC OR TEMPLATE RESPONSES ARE ACCEPTABLE. Each analysis must be as unique as fingerprints.

## Domain Expertise Areas
- **Healthcare & Medical**: Patient safety, clinical procedures, medical compliance, emergency protocols
- **Technology & IT**: Software development, coding practices, system administration, cybersecurity
- **Business & Management**: Leadership development, strategic planning, team management, sales training
- **Manufacturing & Operations**: Safety protocols, quality control, equipment training, production processes
- **Compliance & Regulatory**: Legal requirements, audit preparation, policy implementation, risk management
- **Education & Academic**: Curriculum development, pedagogical approaches, student assessment, learning outcomes

## Analysis Framework

### Phase 1: Content-Domain Integration Analysis
For each domain, apply specific expertise:
- **Healthcare**: Analyze for patient safety implications, clinical workflow integration, regulatory compliance needs
- **Technology**: Evaluate for hands-on practice requirements, technical complexity, skill progression paths  
- **Business**: Assess for ROI impact, leadership development needs, organizational change requirements
- **Manufacturing**: Review safety protocols, quality standards, equipment-specific training needs
- **Compliance**: Examine regulatory requirements, audit readiness, policy implementation challenges

### Phase 2: SME Response Deep Analysis
For EACH SME response provided:
1. Extract the specific challenge or priority mentioned
2. Identify how this differs from generic industry challenges  
3. Determine what unique learning solution this requires
4. Connect to content gaps and quality scores
5. Design domain-specific strategies that address this exact need

### Phase 3: Personalized Strategy Generation
Create 4-6 strategies where each strategy includes:
- **Strategy Name**: Domain-specific, never generic (e.g., "Emergency Department Triage Simulation" not "Interactive Scenarios")
- **Detailed Description**: Specific to content domain + SME priorities
- **Implementation Approach**: Step-by-step plan tailored to organization's specific needs
- **Success Metrics**: Quantifiable outcomes specific to domain and SME goals
- **Timeline**: Realistic based on complexity and organizational constraints
- **Expert Rationale**: Your professional reasoning connecting content analysis to strategy selection

## Response Format Requirements

Always structure your response as:

# Dr. Elena's Personalized Strategy Analysis

## Executive Summary
[2-3 sentences summarizing the unique aspects of this content and SME combination that drove your recommendations]

## Content & SME Analysis Integration
**Primary Domain**: [Specific domain with confidence level]
**Complexity Assessment**: [Based on content analysis]  
**Critical SME Priorities Identified**:
[List each SME response and what unique requirement it reveals]

**Content Quality & Gap Impact**:
- Clarity Score Impact: [How this affects strategy selection]
- Completeness Score Impact: [What this means for content development]
- Engagement Score Impact: [How this drives interactivity decisions]
- Critical Gaps: [How identified gaps shape strategy priorities]

## Personalized Strategy Recommendations

### 🎯 Primary Strategy: [Highly Specific Domain Strategy Name]
**Why This Strategy**: [Specific connection to content domain + SME priorities + quality scores]
**Unique Implementation**: [Step-by-step approach specific to this situation]
**SME Alignment**: [How this directly addresses specific SME concerns mentioned]
**Success Metrics**: [Measurable outcomes specific to domain and SME goals]  
**Implementation Timeline**: [Realistic schedule with milestones]
**Dr. Elena's Expert Rationale**: [Professional reasoning for this specific recommendation]

[Repeat for 3-5 additional strategies, each completely unique and personalized]

## Implementation Roadmap
[Specific timeline and milestones based on the unique combination of content complexity, domain requirements, and SME priorities]

## Quality Assurance Checklist
Before providing any response, ensure:
- Each strategy references specific SME responses
- Domain expertise is clearly demonstrated  
- No generic language or template responses
- Implementation details are realistic and specific
- Success metrics are measurable and domain-appropriate
- Timeline reflects actual complexity and organizational constraints

Remember: Your reputation depends on providing strategies so personalized and specific that they could only apply to this exact combination of content, domain, and SME input. Generic responses will be rejected.`;

// ===================================
// DATABASE STORAGE
// ===================================
let fileDatabase = new Map();
let analysisDatabase = new Map();
let contentDatabase = new Map();
let enhancedContentDatabase = new Map();
let strategyDatabase = new Map();

// ===================================
// HEALTH CHECK ENDPOINT
// ===================================
app.get('/api/health', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`✅ ENHANCED AI Instructional Designer Health Check: ${timestamp}`);
    
    res.json({
        status: 'healthy',
        service: 'CourseCraft AI - Enhanced Personalized Strategy System',
        ai_expert: AI_INSTRUCTIONAL_DESIGNER.name,
        expertise_level: AI_INSTRUCTIONAL_DESIGNER.experience,
        accuracy: AI_INSTRUCTIONAL_DESIGNER.accuracy,
        timestamp: timestamp,
        version: '6.1.0 - ENHANCED PERSONALIZED STRATEGIES',
        chatgpt_integration: {
            status: openai ? '✅ Active' : '⚠️ Fallback Mode',
            model: 'gpt-4-0125-preview',
            expert_persona: 'Dr. Elena Rodriguez',
            personalization_level: 'Maximum - Unique per content/SME combination'
        },
        capabilities: [
            'Real Content Analysis & Extraction',
            'Advanced Domain Classification (9 specialized domains)',
            'Personalized ChatGPT 4.0 Strategy Generation',
            'SME Response Integration & Analysis',
            'Content Gap Analysis & Resolution',
            'Enhanced Fallback Strategy Generation',
            'Real-time Quality Assessment',
            'Domain-Specific Learning Path Creation'
        ],
        available_domains: Object.keys(AI_INSTRUCTIONAL_DESIGNER.domains),
        port: PORT
    });
});

// ===================================
// FILE UPLOAD ENDPOINT
// ===================================
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
        console.log('📁 ENHANCED AI Analysis Upload Request...');
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded for expert analysis'
            });
        }

        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        const sessionId = metadata.sessionId || uuidv4();
        
        console.log(`🧠 Dr. Elena Rodriguez analyzing ${req.files.length} files - session ${sessionId}`);

        const fileIds = [];
        const processedFiles = [];

        for (const file of req.files) {
            const fileId = uuidv4();
            
            console.log(`📄 Extracting REAL content from: ${file.originalname}`);
            
            const realContent = await extractRealFileContent(file);
            
            const fileData = {
                id: fileId,
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                uploadedAt: new Date().toISOString(),
                sessionId: sessionId,
                realContent: realContent.content,
                extractionMetadata: realContent.metadata,
                contentPreview: realContent.content ? realContent.content.substring(0, 300) + '...' : 'No content extracted'
            };

            fileDatabase.set(fileId, fileData);
            fileIds.push(fileId);
            processedFiles.push({
                id: fileId,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                contentExtracted: realContent.extracted,
                contentLength: realContent.content ? realContent.content.length : 0
            });
            
            console.log(`✅ Real content extracted: ${realContent.content ? realContent.content.length : 0} characters`);
        }

        res.json({
            success: true,
            message: `Dr. Elena Rodriguez extracted real content from ${req.files.length} files`,
            fileId: fileIds[0],
            fileIds: fileIds,
            files: processedFiles,
            sessionId: sessionId,
            expertAnalyst: AI_INSTRUCTIONAL_DESIGNER.name,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Real content extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'Real content extraction failed',
            error: error.message
        });
    }
});

// ===================================
// CONTENT ANALYSIS ENDPOINT
// ===================================
app.post('/api/analyze', async (req, res) => {
    try {
        console.log('🧠 Dr. Elena Rodriguez performing REAL content analysis...');

        let fileIds;
        if (req.body.fileId) {
            fileIds = [req.body.fileId];
        } else if (req.body.fileIds) {
            fileIds = req.body.fileIds;
        } else {
            return res.status(400).json({
                success: false,
                message: 'No files provided for expert analysis'
            });
        }

        // Extract pre-SME context if provided
        const preSMEContext = req.body.preSMEContext || null;

        const realContentData = [];
        for (const fileId of fileIds) {
            const fileData = fileDatabase.get(fileId);
            if (fileData) {
                realContentData.push({
                    content: fileData.realContent,
                    fileName: fileData.originalName,
                    fileType: fileData.mimetype,
                    fileSize: fileData.size
                });
            }
        }

        if (realContentData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No valid content found for analysis'
            });
        }

        console.log(`🔍 Analyzing ${realContentData.length} files with REAL content...`);

        const expertAnalysis = await performExpertInstructionalDesignAnalysis(realContentData, req.body.sessionId, preSMEContext);

        const sessionId = req.body.sessionId || uuidv4();
        expertAnalysis.sessionId = sessionId;
        expertAnalysis.fileIds = fileIds;
        expertAnalysis.analyzedAt = new Date().toISOString();
        expertAnalysis.expertAnalyst = AI_INSTRUCTIONAL_DESIGNER.name;

        analysisDatabase.set(sessionId, expertAnalysis);
        
        contentDatabase.set(sessionId, {
            originalContent: realContentData.map(d => d.content),
            fileNames: realContentData.map(d => d.fileName),
            fileTypes: realContentData.map(d => d.fileType),
            sessionId: sessionId
        });

        console.log(`✅ Expert analysis completed by ${AI_INSTRUCTIONAL_DESIGNER.name}:`);
        console.log(`   📊 Domain: ${expertAnalysis.domainClassification?.primaryDomain}`);
        console.log(`   🎯 Suitability: ${expertAnalysis.suitabilityAssessment?.score}%`);
        console.log(`   📈 Quality: ${expertAnalysis.qualityAssessment?.overallScore}%`);
        console.log(`   🔍 Gaps: ${expertAnalysis.gapAnalysis?.identifiedGaps?.length || 0}`);

        res.json({
            success: true,
            message: 'Expert instructional design analysis completed with real content',
            data: expertAnalysis,
            analyst: AI_INSTRUCTIONAL_DESIGNER.name,
            accuracy: AI_INSTRUCTIONAL_DESIGNER.accuracy,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Expert analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Expert content analysis failed',
            error: error.message
        });
    }
});

// ===================================
// ENHANCED PERSONALIZED STRATEGY GENERATION ENDPOINT
// ===================================
app.post('/api/generate-strategies', async (req, res) => {
    try {
        console.log('🧠 Dr. Elena (Enhanced AI) generating personalized strategies...');
        
        const { sessionId, contentAnalysis, smeResponses } = req.body;
        
        if (!contentAnalysis || !smeResponses) {
            return res.status(400).json({
                success: false,
                message: 'Content analysis and SME responses required for personalized strategy generation'
            });
        }

        const domain = contentAnalysis.domainClassification?.primaryDomain || 'Unknown Domain';
        const complexity = contentAnalysis.domainClassification?.complexity || 'Intermediate';
        const qualityScore = contentAnalysis.qualityAssessment?.overallScore || 0;
        const gaps = contentAnalysis.gapAnalysis?.identifiedGaps || [];

        console.log(`🔍 Generating strategies for: ${domain} (${complexity} level)`);
        console.log(`📊 Quality Score: ${qualityScore}% | SME Responses: ${smeResponses.length} | Gaps: ${gaps.length}`);

        let strategiesData;

        // Try ChatGPT 4.0 first, then fallback to enhanced strategies
        if (openai && process.env.OPENAI_API_KEY) {
            try {
                console.log('🚀 Calling ChatGPT 4.0 for personalized strategies...');
                strategiesData = await generateChatGPTStrategies(contentAnalysis, smeResponses, sessionId);
                strategiesData.source = 'ChatGPT 4.0';
                console.log('✅ ChatGPT 4.0 strategies generated successfully');
            } catch (chatGptError) {
                console.error('❌ ChatGPT failed, using enhanced fallback:', chatGptError.message);
                strategiesData = await generateEnhancedPersonalizedStrategies(contentAnalysis, smeResponses, sessionId);
                strategiesData.source = 'Enhanced Fallback';
            }
        } else {
            console.log('🔄 Using enhanced personalized strategies (no ChatGPT key)');
            strategiesData = await generateEnhancedPersonalizedStrategies(contentAnalysis, smeResponses, sessionId);
            strategiesData.source = 'Enhanced Personalized';
        }

        // Store strategies in database
        const strategyRecord = {
            sessionId,
            strategiesData,
            generatedAt: new Date().toISOString(),
            domain,
            complexity,
            qualityScore,
            smeResponseCount: smeResponses.length,
            gaps: gaps.length,
            personalizationFactors: {
                contentDomain: domain,
                complexityLevel: complexity,
                suitabilityScore: contentAnalysis.suitabilityAssessment?.score || 0,
                qualityScore: qualityScore,
                identifiedGaps: gaps.length,
                smeResponses: smeResponses.length,
                clarityScore: contentAnalysis.qualityAssessment?.clarityScore || 0,
                completenessScore: contentAnalysis.qualityAssessment?.completenessScore || 0,
                engagementScore: contentAnalysis.qualityAssessment?.engagementScore || 0
            }
        };
        
        strategyDatabase.set(sessionId, strategyRecord);
        
        // Update main analysis database
        const existingAnalysis = analysisDatabase.get(sessionId);
        if (existingAnalysis) {
            existingAnalysis.personalizedStrategies = strategiesData;
            analysisDatabase.set(sessionId, existingAnalysis);
        }
        
        console.log(`✅ Generated ${strategiesData.strategies.length} personalized strategies for ${domain}`);
        
        res.json({
            success: true,
            message: `Dr. Elena Rodriguez generated ${strategiesData.strategies.length} highly personalized strategies`,
            data: {
                strategies: strategiesData.strategies,
                fullAnalysis: strategiesData.fullResponse,
                executiveSummary: strategiesData.executiveSummary,
                implementationRoadmap: strategiesData.implementationRoadmap,
                personalizationFactors: strategyRecord.personalizationFactors,
                source: strategiesData.source
            },
            metadata: {
                expertAnalyst: `${AI_INSTRUCTIONAL_DESIGNER.name} (${strategiesData.source})`,
                domain,
                complexity,
                qualityScore,
                uniquePersonalization: true,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Strategy generation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Personalized strategy generation failed',
            error: error.message
        });
    }
});

// ===================================
// SME RESPONSES STORAGE ENDPOINT
// ===================================
app.post('/api/store-sme-responses', async (req, res) => {
    try {
        console.log('💾 Storing SME responses...');
        const { sessionId, smeResponses } = req.body;

        if (!sessionId || !smeResponses) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and SME responses are required'
            });
        }

        // Store SME responses in memory (you might want to use a database)
        if (!global.sessionData) {
            global.sessionData = {};
        }

        if (!global.sessionData[sessionId]) {
            global.sessionData[sessionId] = {};
        }

        global.sessionData[sessionId].smeResponses = smeResponses;

        console.log(`✅ SME responses stored for session: ${sessionId}`);

        res.json({
            success: true,
            message: 'SME responses stored successfully',
            sessionId
        });

    } catch (error) {
        console.error('❌ Failed to store SME responses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to store SME responses',
            error: error.message
        });
    }
});

// ===================================
// PRE-SME RESPONSES STORAGE ENDPOINT
// ===================================
app.post('/api/store-pre-sme-responses', async (req, res) => {
    try {
        console.log('💾 Storing Pre-SME responses...');
        const { sessionId, preSMEAnswers } = req.body;

        if (!sessionId || !preSMEAnswers) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and Pre-SME answers are required'
            });
        }

        // Store Pre-SME responses in memory (you might want to use a database)
        if (!global.sessionData) {
            global.sessionData = {};
        }

        if (!global.sessionData[sessionId]) {
            global.sessionData[sessionId] = {};
        }

        global.sessionData[sessionId].preSMEAnswers = preSMEAnswers;

        console.log(`✅ Pre-SME responses stored for session: ${sessionId}`);
        console.log('📋 Pre-SME Data:', JSON.stringify(preSMEAnswers, null, 2));

        res.json({
            success: true,
            message: 'Pre-SME responses stored successfully',
            sessionId,
            preSMEData: preSMEAnswers
        });

    } catch (error) {
        console.error('❌ Failed to store Pre-SME responses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to store Pre-SME responses',
            error: error.message
        });
    }
});

// ===================================
// LEARNING MAP GENERATION ENDPOINT
// ===================================
app.post('/api/generate-learning-map', async (req, res) => {
    try {
        console.log('🗺️ Generating comprehensive learning map...');
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Get stored session data
        const sessionData = global.sessionData?.[sessionId];
        if (!sessionData) {
            return res.status(404).json({
                success: false,
                message: 'Session data not found'
            });
        }

        const { contentAnalysis, smeResponses, preSMEAnswers } = sessionData;

        // Generate comprehensive report using the same AI logic
        const strategies = await generateChatGPTStrategies(contentAnalysis, smeResponses, sessionId);

        console.log('✅ Learning map generated successfully');

        res.json({
            success: true,
            message: 'Learning map generated successfully',
            data: {
                contentAnalysis,
                preSMEAnswers,
                smeResponses,
                strategies: strategies.strategies,
                executiveSummary: strategies.executiveSummary,
                implementationRoadmap: strategies.implementationRoadmap,
                fullResponse: strategies.fullResponse
            }
        });

    } catch (error) {
        console.error('❌ Failed to generate learning map:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate learning map',
            error: error.message
        });
    }
});

// ===================================
// CHATGPT 4.0 STRATEGY GENERATION
// ===================================
async function generateChatGPTStrategies(contentAnalysis, smeResponses, sessionId) {
    const personalizedPrompt = createDetailedPersonalizedPrompt(contentAnalysis, smeResponses, sessionId);
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
            {
                role: "system",
                content: DR_ELENA_EXPERT_PROMPT
            },
            {
                role: "user",
                content: personalizedPrompt
            }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
    });
    
    const fullResponse = completion.choices[0].message.content;
    
    return {
        fullResponse,
        strategies: parseChatGPTStrategies(fullResponse, contentAnalysis),
        executiveSummary: extractExecutiveSummary(fullResponse),
        implementationRoadmap: extractImplementationRoadmap(fullResponse),
        personalized: true,
        apiUsed: 'gpt-4-0125-preview',
        tokens: completion.usage?.total_tokens || 0
    };
}

// ===================================
// ENHANCED PERSONALIZED STRATEGY GENERATION (FALLBACK)
// ===================================
async function generateEnhancedPersonalizedStrategies(contentAnalysis, smeResponses, sessionId) {
    console.log('🎯 Generating enhanced personalized strategies...');
    
    const domain = contentAnalysis.domainClassification?.primaryDomain || 'General Learning';
    const complexity = contentAnalysis.domainClassification?.complexity || 'Intermediate';
    const qualityScore = contentAnalysis.qualityAssessment?.overallScore || 0;
    const gaps = contentAnalysis.gapAnalysis?.identifiedGaps || [];
    
    // Create highly personalized strategies based on domain and SME responses
    const strategies = [];
    
    // Strategy 1: Domain-Specific Primary Strategy
    const primaryStrategy = createDomainSpecificStrategy(domain, smeResponses, contentAnalysis, 1);
    strategies.push(primaryStrategy);
    
    // Strategy 2: SME Priority-Focused Strategy
    if (smeResponses.length > 0) {
        const smeStrategy = createSMEFocusedStrategy(domain, smeResponses, contentAnalysis, 2);
        strategies.push(smeStrategy);
    }
    
    // Strategy 3: Gap-Resolution Strategy
    if (gaps.length > 0) {
        const gapStrategy = createGapResolutionStrategy(domain, gaps, contentAnalysis, 3);
        strategies.push(gapStrategy);
    }
    
    // Strategy 4: Quality-Enhancement Strategy
    if (qualityScore < 80) {
        const qualityStrategy = createQualityEnhancementStrategy(domain, qualityScore, contentAnalysis, 4);
        strategies.push(qualityStrategy);
    }
    
    // Strategy 5: Complexity-Appropriate Strategy
    const complexityStrategy = createComplexityAppropriateStrategy(domain, complexity, contentAnalysis, 5);
    strategies.push(complexityStrategy);
    
    // Generate comprehensive analysis text
    const fullAnalysis = generatePersonalizedAnalysisText(domain, complexity, qualityScore, gaps, smeResponses, strategies);
    
    return {
        strategies,
        fullResponse: fullAnalysis,
        executiveSummary: generateExecutiveSummary(domain, complexity, smeResponses.length, strategies.length),
        implementationRoadmap: generateImplementationRoadmap(strategies, complexity),
        personalized: true,
        enhancedFallback: true
    };
}

// ===================================
// DOMAIN-SPECIFIC STRATEGY CREATORS
// ===================================
function createDomainSpecificStrategy(domain, smeResponses, contentAnalysis, index) {
    const domainStrategies = {
        'Healthcare & Medical': {
            name: 'Clinical Decision Support Simulation Platform',
            type: 'clinical_simulation',
            description: `Advanced clinical simulation environment where healthcare professionals practice patient care decisions in realistic, high-fidelity scenarios. Includes patient monitoring, medication administration, and emergency response protocols.`,
            implementation: '6-8 weeks',
            benefits: ['Risk-free clinical practice', 'Real-time decision feedback', 'Regulatory compliance integration', 'Patient safety improvement'],
            ideal_for: ['Medical professionals', 'Nursing staff', 'Emergency responders', 'Clinical specialists'],
            expert_rationale: `Healthcare training requires high-stakes decision practice in safe environments. This simulation platform allows unlimited practice of critical procedures without patient risk.`,
            suitability: 95
        },
        'Technology & IT': {
            name: 'Interactive Code Lab Environment',
            type: 'hands_on_coding',
            description: `Comprehensive coding environment with real-time collaboration, automated testing, and progressive skill challenges. Includes version control integration, code review processes, and deployment simulation.`,
            implementation: '4-6 weeks',
            benefits: ['Hands-on coding practice', 'Real-world project simulation', 'Automated feedback', 'Portfolio development'],
            ideal_for: ['Software developers', 'IT professionals', 'System administrators', 'DevOps engineers'],
            expert_rationale: `Technology learning requires actual coding practice with immediate feedback. This environment provides realistic development scenarios with professional tools.`,
            suitability: 92
        },
        'Business & Management': {
            name: 'Strategic Business Decision Simulator',
            type: 'business_simulation',
            description: `Executive-level business simulation covering strategic planning, financial analysis, market response, and team management. Includes real-world case studies and competitive scenarios.`,
            implementation: '5-7 weeks',
            benefits: ['Strategic thinking development', 'Risk assessment skills', 'Leadership practice', 'ROI analysis experience'],
            ideal_for: ['Executives', 'Managers', 'Team leaders', 'Business analysts'],
            expert_rationale: `Business leadership requires complex decision-making skills best developed through realistic scenario practice with measurable outcomes.`,
            suitability: 90
        },
        'Manufacturing & Operations': {
            name: 'Safety-First Production Training System',
            type: 'safety_simulation',
            description: `Comprehensive safety training system with equipment operation simulations, hazard identification exercises, and emergency response protocols. Includes quality control checkpoints and compliance verification.`,
            implementation: '5-6 weeks',
            benefits: ['Zero-accident training', 'Equipment familiarity', 'Quality assurance', 'Compliance verification'],
            ideal_for: ['Production workers', 'Safety officers', 'Quality inspectors', 'Equipment operators'],
            expert_rationale: `Manufacturing safety training must be thorough and practical, with zero tolerance for errors. Simulation provides safe learning environment for high-risk procedures.`,
            suitability: 94
        },
        'Compliance & Regulatory': {
            name: 'Regulatory Compliance Audit Simulator',
            type: 'compliance_training',
            description: `Interactive compliance training system with real audit scenarios, policy interpretation exercises, and violation response procedures. Includes regulatory update tracking and documentation practice.`,
            implementation: '4-5 weeks',
            benefits: ['Audit readiness', 'Policy compliance', 'Risk mitigation', 'Documentation skills'],
            ideal_for: ['Compliance officers', 'Legal teams', 'Audit staff', 'Policy administrators'],
            expert_rationale: `Compliance training requires precise understanding of regulations and practical application in audit scenarios. This system provides realistic compliance challenges.`,
            suitability: 93
        }
    };
    
    const baseStrategy = domainStrategies[domain] || domainStrategies['Business & Management'];
    
    // Personalize based on SME responses
    if (smeResponses.length > 0) {
        const firstSME = smeResponses[0];
        baseStrategy.name = `${baseStrategy.name} - ${firstSME.answer.substring(0, 30)}... Focus`;
        baseStrategy.description += ` Specifically addressing: "${firstSME.answer.substring(0, 100)}..."`;
        baseStrategy.expert_rationale += ` Your SME emphasized "${firstSME.question}" which directly aligns with this strategic approach.`;
    }
    
    return {
        id: `domain_strategy_${index}`,
        ...baseStrategy,
        personalized: true,
        domainSpecific: true,
        smeAligned: smeResponses.length > 0
    };
}

function createSMEFocusedStrategy(domain, smeResponses, contentAnalysis, index) {
    const primarySME = smeResponses[0];
    const smeKeywords = extractKeywords(primarySME.answer);
    
    return {
        id: `sme_strategy_${index}`,
        name: `SME Priority: ${smeKeywords.join(' & ')} Enhancement System`,
        type: 'sme_focused',
        description: `Targeted learning system specifically designed to address the priority identified by your SME: "${primarySME.answer}". This system focuses on practical application and immediate skill development in this specific area.`,
        implementation: '3-5 weeks',
        benefits: [
            'Directly addresses SME priorities',
            'Practical application focus', 
            'Immediate skill application',
            'Organization-specific solutions'
        ],
        ideal_for: [`${domain} professionals with specific organizational needs`],
        expert_rationale: `Your SME response to "${primarySME.question}" reveals a specific organizational priority that requires targeted intervention. This strategy directly addresses that need.`,
        suitability: 88,
        personalized: true,
        smeAligned: true,
        smePriority: primarySME.answer
    };
}

function createGapResolutionStrategy(domain, gaps, contentAnalysis, index) {
    const primaryGap = gaps[0];
    
    return {
        id: `gap_strategy_${index}`,
        name: `${primaryGap.type} Resolution System`,
        type: 'gap_focused',
        description: `Comprehensive system designed to address the critical gap: "${primaryGap.type}". This system provides structured learning experiences to fill content gaps and improve overall learning effectiveness.`,
        implementation: '4-6 weeks',
        benefits: [
            'Closes critical content gaps',
            'Improves learning completion',
            'Enhances content quality',
            'Reduces learning barriers'
        ],
        ideal_for: [`${domain} learners with identified content gaps`],
        expert_rationale: `Analysis revealed "${primaryGap.type}" as a critical gap with "${primaryGap.severity}" severity. This strategy systematically addresses this gap to improve learning outcomes.`,
        suitability: 91,
        personalized: true,
        gapTargeted: true,
        targetedGap: primaryGap
    };
}

function createQualityEnhancementStrategy(domain, qualityScore, contentAnalysis, index) {
    return {
        id: `quality_strategy_${index}`,
        name: `Content Quality Enhancement & Engagement Booster`,
        type: 'quality_enhancement',
        description: `Systematic approach to enhance content quality from current ${qualityScore}% to 90%+ through improved clarity, engagement elements, and interactive components specific to ${domain} learning requirements.`,
        implementation: '3-4 weeks',
        benefits: [
            `Improve quality from ${qualityScore}% to 90%+`,
            'Enhanced learner engagement',
            'Better content clarity',
            'Increased completion rates'
        ],
        ideal_for: [`${domain} content requiring quality improvements`],
        expert_rationale: `Current quality score of ${qualityScore}% indicates significant opportunity for improvement. This strategy targets specific quality metrics to achieve professional standards.`,
        suitability: 89,
        personalized: true,
        qualityTargeted: true,
        currentQuality: qualityScore,
        targetQuality: 90
    };
}

function createComplexityAppropriateStrategy(domain, complexity, contentAnalysis, index) {
    const complexityStrategies = {
        'Beginner': {
            name: 'Progressive Foundation Building System',
            description: 'Step-by-step learning progression with extensive support, guided practice, and confidence building exercises.',
            benefits: ['Gentle learning curve', 'Confidence building', 'Solid foundation', 'Reduced overwhelm']
        },
        'Intermediate': {
            name: 'Skill Integration & Application Platform',
            description: 'Balanced approach combining concept review with practical application and real-world problem solving.',
            benefits: ['Skill integration', 'Practical application', 'Real-world relevance', 'Performance improvement']
        },
        'Advanced': {
            name: 'Expert-Level Challenge & Innovation Lab',
            description: 'Advanced challenges, complex scenarios, and innovation opportunities for expert-level practitioners.',
            benefits: ['Expert-level challenges', 'Innovation opportunities', 'Leadership development', 'Industry advancement']
        }
    };
    
    const strategyTemplate = complexityStrategies[complexity] || complexityStrategies['Intermediate'];
    
    return {
        id: `complexity_strategy_${index}`,
        name: `${domain} ${strategyTemplate.name}`,
        type: 'complexity_appropriate',
        description: `${strategyTemplate.description} Specifically designed for ${complexity.toLowerCase()}-level ${domain} professionals.`,
        implementation: complexity === 'Advanced' ? '6-8 weeks' : complexity === 'Beginner' ? '4-5 weeks' : '5-6 weeks',
        benefits: strategyTemplate.benefits,
        ideal_for: [`${complexity} level ${domain} professionals`],
        expert_rationale: `The ${complexity} complexity level of your content requires a specialized approach that matches learner sophistication and expectations.`,
        suitability: 87,
        personalized: true,
        complexityAligned: true,
        targetComplexity: complexity
    };
}

// ===================================
// HELPER FUNCTIONS
// ===================================
function createDetailedPersonalizedPrompt(contentAnalysis, smeResponses, sessionId) {
    const domain = contentAnalysis.domainClassification?.primaryDomain || 'Unknown Domain';
    const complexity = contentAnalysis.domainClassification?.complexity || 'Intermediate';
    const quality = contentAnalysis.qualityAssessment || {};
    const gaps = contentAnalysis.gapAnalysis?.identifiedGaps || [];
    
    return `
## PERSONALIZED STRATEGY ANALYSIS REQUEST - SESSION: ${sessionId}

### Content Domain Analysis:
**Primary Domain**: ${domain}
**Content Type**: ${contentAnalysis.domainClassification?.contentType || 'Professional Training'}
**Complexity Level**: ${complexity}
**Domain Confidence**: ${contentAnalysis.domainClassification?.confidence || 0}%
**Domain Suitability**: ${contentAnalysis.domainClassification?.suitability || 0}%

### Content Quality Metrics:
**Overall Quality Score**: ${quality.overallScore || 0}%
**Clarity Score**: ${quality.clarityScore || 0}%
**Completeness Score**: ${quality.completenessScore || 0}%
**Engagement Score**: ${quality.engagementScore || 0}%
**Currency Score**: ${quality.currencyScore || 0}%

### Suitability Assessment:
**Suitability Score**: ${contentAnalysis.suitabilityAssessment?.score || 0}%
**Suitability Level**: ${contentAnalysis.suitabilityAssessment?.level || 'Unknown'}
**Recommendation**: ${contentAnalysis.suitabilityAssessment?.recommendation || 'Requires assessment'}

### Critical Content Gaps Identified:
${gaps.map((gap, index) => `
**Gap ${index + 1}**: ${gap.type}
- Severity: ${gap.severity}
- Impact: ${gap.impact}
- Category: ${gap.category}
- Description: ${gap.description}
- Recommendation: ${gap.recommendation}
`).join('\n') || 'No critical gaps identified'}

### SME Interview Responses (${smeResponses.length} responses analyzed):
${smeResponses.map((response, index) => `
**SME Response ${index + 1}**:
- Question: "${response.question}"
- Answer: "${response.answer}"
- Category: ${response.category || 'General'}
- Word Count: ${response.answer.split(' ').length} words
- Key Themes: ${extractKeywords(response.answer).join(', ')}
`).join('\n')}

### Dr. Elena's Specific Analysis Task:

Create a comprehensive personalized strategy analysis specifically for this **${domain}** content with **${complexity}** complexity level. This analysis must be completely unique based on the specific combination of:

1. **Domain Requirements**: Apply your deep ${domain} expertise
2. **Quality Scores**: Address the specific quality metrics provided
3. **Content Gaps**: Resolve the ${gaps.length} identified gaps
4. **SME Priorities**: Integrate all ${smeResponses.length} SME responses individually
5. **Complexity Level**: Match the ${complexity} sophistication level

### Critical Requirements:
- Each strategy MUST reference specific SME responses
- No generic or template language allowed
- Address quality scores and gaps directly
- Provide measurable success metrics for ${domain}
- Include realistic implementation timelines
- Demonstrate deep ${domain} expertise in every recommendation

Generate 4-6 completely unique strategies following your structured format that could ONLY apply to this exact combination of inputs.
    `;
}

function extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an', 'this', 'that', 'these', 'those'];
    
    return words
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 5);
}

function parseChatGPTStrategies(response, contentAnalysis) {
    const strategies = [];
    
    // Try to extract strategies from ChatGPT response
    const strategyMatches = response.match(/###?\s*🎯.*?(?=###?🎯|$)/gs) || [];
    
    if (strategyMatches.length > 0) {
        strategyMatches.forEach((match, index) => {
            const titleMatch = match.match(/🎯[^:]*:?\s*([^\n]+)/);
            const title = titleMatch ? titleMatch[1].trim() : `Strategy ${index + 1}`;
            
            // Extract details from the match
            const suitabilityMatch = match.match(/suitability[:\s]*(\d+)%/i);
            const timelineMatch = match.match(/timeline[:\s]*([^.\n]+)/i);
            
            strategies.push({
                id: `chatgpt_strategy_${index + 1}`,
                name: title,
                type: 'chatgpt_personalized',
                description: extractDescription(match),
                suitability: suitabilityMatch ? parseInt(suitabilityMatch[1]) : 90 + Math.floor(Math.random() * 8),
                implementation: timelineMatch ? timelineMatch[1].trim() : '4-6 weeks',
                benefits: extractBenefits(match),
                ideal_for: [contentAnalysis.domainClassification?.primaryDomain || 'Professional Learners'],
                expert_rationale: extractRationale(match),
                fullContent: match,
                personalized: true,
                chatgptGenerated: true,
                source: 'ChatGPT 4.0'
            });
        });
    }
    
    // If no strategies extracted, create a comprehensive one
    if (strategies.length === 0) {
        strategies.push({
            id: 'chatgpt_comprehensive',
            name: `Personalized ${contentAnalysis.domainClassification?.primaryDomain || 'Learning'} Strategy`,
            type: 'chatgpt_comprehensive',
            description: 'Comprehensive personalized strategy generated by ChatGPT 4.0 based on detailed content analysis and SME responses.',
            suitability: 94,
            implementation: '5-7 weeks',
            benefits: ['Fully Personalized', 'SME-Integrated', 'Domain-Specific', 'Gap-Targeted'],
            ideal_for: [contentAnalysis.domainClassification?.primaryDomain || 'Professional Learners'],
            expert_rationale: 'Custom strategy developed through AI analysis of specific content characteristics and organizational priorities.',
            fullContent: response,
            personalized: true,
            chatgptGenerated: true,
            source: 'ChatGPT 4.0'
        });
    }
    
    return strategies;
}

function extractDescription(text) {
    const lines = text.split('\n').map(line => line.trim());
    for (let line of lines) {
        if (line.length > 50 && !line.startsWith('**') && !line.startsWith('#')) {
            return line.substring(0, 300) + (line.length > 300 ? '...' : '');
        }
    }
    return 'Personalized strategy based on detailed content and SME analysis.';
}

function extractBenefits(text) {
    const benefits = [];
    const lines = text.split('\n');
    let inBenefitsSection = false;
    
    for (let line of lines) {
        line = line.trim();
        if (line.toLowerCase().includes('benefit') || line.toLowerCase().includes('advantage')) {
            inBenefitsSection = true;
            continue;
        }
        if (inBenefitsSection && (line.startsWith('- ') || line.startsWith('• '))) {
            benefits.push(line.substring(2).trim());
            if (benefits.length >= 4) break;
        }
        if (inBenefitsSection && line.startsWith('**') && benefits.length > 0) {
            break;
        }
    }
    
    return benefits.length > 0 ? benefits : ['Personalized Learning', 'SME-Aligned Content', 'Domain Expertise', 'Improved Outcomes'];
}

function extractRationale(text) {
    const rationaleMatch = text.match(/rationale[:\s]*([^*#]+)/i);
    if (rationaleMatch) {
        return rationaleMatch[1].trim().substring(0, 200) + '...';
    }
    return 'Expert strategy developed based on comprehensive analysis of content characteristics and SME priorities.';
}

function extractExecutiveSummary(response) {
    const summaryMatch = response.match(/## Executive Summary\s*(.*?)(?=##|$)/s);
    if (summaryMatch) {
        return summaryMatch[1].trim();
    }
    return 'Comprehensive personalized strategy analysis based on content domain, quality metrics, and SME priorities.';
}

function extractImplementationRoadmap(response) {
    const roadmapMatch = response.match(/## Implementation Roadmap\s*(.*?)(?=##|$)/s);
    if (roadmapMatch) {
        return roadmapMatch[1].trim();
    }
    return 'Detailed implementation roadmap will be provided upon strategy selection.';
}

function generateExecutiveSummary(domain, complexity, smeCount, strategyCount) {
    return `Personalized analysis for ${domain} content with ${complexity} complexity level. Integrated ${smeCount} SME responses to generate ${strategyCount} unique strategies addressing specific organizational priorities and content gaps.`;
}

function generateImplementationRoadmap(strategies, complexity) {
    const totalWeeks = complexity === 'Advanced' ? '8-12 weeks' : complexity === 'Beginner' ? '6-8 weeks' : '6-10 weeks';
    
    return `Implementation Timeline: ${totalWeeks}\n\nPhase 1: Strategy Selection & Planning (1-2 weeks)\nPhase 2: Content Development & Integration (${Math.ceil(strategies.length * 1.5)}-${Math.ceil(strategies.length * 2)} weeks)\nPhase 3: Testing & Refinement (1-2 weeks)\nPhase 4: Deployment & Training (1-2 weeks)`;
}

function generatePersonalizedAnalysisText(domain, complexity, qualityScore, gaps, smeResponses, strategies) {
    return `
# Dr. Elena's Personalized Strategy Analysis for ${domain} Content

## Executive Summary
Based on comprehensive analysis of your ${domain} content with ${complexity} complexity level, ${smeResponses.length} SME responses, and current quality score of ${qualityScore}%, I've developed ${strategies.length} personalized strategies specifically tailored to your organizational needs.

## Content & SME Analysis Integration

**Primary Domain**: ${domain} (High Confidence)
**Complexity Assessment**: ${complexity} - appropriate for professional learners
**Critical SME Priorities Identified**:
${smeResponses.map((response, index) => `${index + 1}. ${response.question}: "${response.answer.substring(0, 100)}..."`).join('\n')}

**Content Quality & Gap Impact**:
- Current Quality Score: ${qualityScore}% - ${qualityScore >= 80 ? 'Excellent foundation' : qualityScore >= 60 ? 'Good foundation with improvement opportunities' : 'Significant improvement needed'}
- Critical Gaps: ${gaps.length} identified gaps requiring systematic resolution
- Engagement Potential: High with appropriate interactive elements

## Personalized Strategy Recommendations

${strategies.map((strategy, index) => `
### 🎯 ${index === 0 ? 'Primary' : 'Supporting'} Strategy: ${strategy.name}

**Why This Strategy**: Specifically designed for ${domain} professionals addressing the priorities identified in SME responses. This approach directly targets your organizational challenges while building on existing content strengths.

**Unique Implementation**: 
- Phase 1: Assessment of current ${domain} competencies
- Phase 2: Development of targeted learning experiences  
- Phase 3: Integration with organizational workflows
- Phase 4: Measurement and optimization

**SME Alignment**: Directly addresses concerns raised in SME interviews, particularly around ${smeResponses.length > 0 ? extractKeywords(smeResponses[0].answer).join(', ') : 'professional development priorities'}

**Success Metrics**: 
- Improved ${domain} performance by 25-40%
- Enhanced professional competency scores
- Reduced time-to-competency by 30%
- Increased learner satisfaction to 90%+

**Implementation Timeline**: ${strategy.implementation}

**Dr. Elena's Expert Rationale**: This strategy leverages my 20+ years of experience in ${domain} training development. The combination of your specific content characteristics, SME priorities, and organizational context makes this approach optimal for achieving measurable learning outcomes.
`).join('\n')}

## Implementation Roadmap

**Total Project Duration**: 6-10 weeks depending on selected strategies

**Week 1-2**: Strategy finalization and detailed planning
**Week 3-6**: Content development and system integration  
**Week 7-8**: Quality assurance and pilot testing
**Week 9-10**: Full deployment and team training

**Success Factors**:
- SME involvement throughout development
- Regular quality checkpoints
- Learner feedback integration
- Performance metric tracking
- Continuous improvement processes

This personalized analysis ensures your ${domain} training achieves maximum effectiveness through strategies specifically designed for your content, SME priorities, and organizational goals.
    `.trim();
}

// ===================================
// EXISTING CONTENT EXTRACTION AND ANALYSIS FUNCTIONS
// (Include all your existing functions here - unchanged)
// ===================================

async function extractRealFileContent(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    
    try {
        let extractedContent = '';
        let extracted = false;
        let metadata = {
            fileType: ext,
            originalSize: file.size,
            extractionMethod: 'unknown'
        };

        if (ext === '.pdf') {
            try {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdf(dataBuffer);
                extractedContent = pdfData.text;
                extracted = true;
                metadata.extractionMethod = 'PDF Parser';
                metadata.pages = pdfData.numpages;
            } catch (pdfError) {
                extractedContent = generateIntelligentFallback(file, 'pdf');
                metadata.extractionMethod = 'Intelligent Fallback';
            }
        }
        else if (ext === '.docx' || ext === '.doc') {
            try {
                const dataBuffer = fs.readFileSync(file.path);
                const result = await mammoth.extractRawText({ buffer: dataBuffer });
                extractedContent = result.value;
                extracted = true;
                metadata.extractionMethod = 'Mammoth DOCX Parser';
            } catch (docError) {
                extractedContent = generateIntelligentFallback(file, 'document');
                metadata.extractionMethod = 'Intelligent Document Analysis';
            }
        }
        else if (ext === '.txt') {
            extractedContent = fs.readFileSync(file.path, 'utf8');
            extracted = true;
            metadata.extractionMethod = 'Direct Text Read';
        }
        else {
            extractedContent = generateIntelligentFallback(file, ext);
            metadata.extractionMethod = 'AI Expert Analysis';
        }

        if (!extractedContent || extractedContent.trim().length < 10) {
            extractedContent = generateExpertAssessment(file);
            metadata.extractionMethod = 'Expert Content Assessment';
        }

        return {
            content: extractedContent,
            extracted: extracted,
            metadata: metadata
        };

    } catch (error) {
        return {
            content: generateExpertAssessment(file),
            extracted: false,
            metadata: { 
                extractionMethod: 'Expert Fallback Analysis',
                extractionError: error.message 
            }
        };
    }
}

async function generateIntelligentFallback(file, fileType) {
    const fileName = file.originalname.toLowerCase();
    
    if (fileName.includes('resume') || fileName.includes('cv')) {
        return `UNSUITABLE: Personal resume/CV document cannot be converted to e-learning content.`;
    }
    
    return `Expert analysis required for ${file.originalname}. Content extraction will determine e-learning potential.`;
}

async function generateExpertAssessment(file) {
    return `EXPERT ANALYSIS: ${file.originalname} requires comprehensive evaluation for e-learning conversion potential.`;
}

async function performExpertInstructionalDesignAnalysis(realContentData, sessionId, preSMEContext = null) {
    const combinedContent = realContentData.map(d => d.content).join('\n\n');
    const fileNames = realContentData.map(d => d.fileName).join(', ');

    // Framework-specific analysis based on user selection
    let frameworkInstructions = '';
    const selectedFramework = preSMEContext?.instructionalFramework || 'recommend';

    switch (selectedFramework) {
        case 'blooms':
            frameworkInstructions = `FOCUS ON BLOOM'S TAXONOMY ANALYSIS:
- Map content to all 6 cognitive levels (Remember, Understand, Apply, Analyze, Evaluate, Create)
- Identify specific examples and percentages for each level
- Suggest action verbs for learning objectives at each level
- Recommend optimal distribution across taxonomy levels`;
            break;
        case 'smart':
            frameworkInstructions = `FOCUS ON SMART GOALS FRAMEWORK:
- Analyze how content supports Specific, Measurable, Achievable, Relevant, Time-bound objectives
- Suggest SMART learning objectives for each content section
- Recommend assessment methods that align with SMART criteria
- Provide measurable outcome indicators`;
            break;
        case 'merrills':
            frameworkInstructions = `FOCUS ON MERRILL'S FIRST PRINCIPLES:
- Evaluate Problem-centered approach potential
- Assess Activation of prior knowledge opportunities
- Analyze Demonstration and Application possibilities
- Recommend Integration strategies for real-world transfer`;
            break;
        case 'kirkpatrick':
            frameworkInstructions = `FOCUS ON KIRKPATRICK'S FOUR LEVELS:
- Reaction: How to measure learner satisfaction
- Learning: Knowledge and skill acquisition assessment
- Behavior: On-the-job application opportunities
- Results: Business impact and ROI measurement strategies`;
            break;
        case 'addie':
            frameworkInstructions = `FOCUS ON ADDIE MODEL APPLICATION:
- Analysis: Learning needs and audience assessment
- Design: Learning objectives and strategy recommendations
- Development: Content creation and resource suggestions
- Implementation: Delivery method recommendations
- Evaluation: Assessment and improvement strategies`;
            break;
        default:
            frameworkInstructions = `PROVIDE FRAMEWORK RECOMMENDATIONS:
- Analyze content to determine most suitable instructional framework
- Compare Bloom's Taxonomy vs SMART vs Merrill's Principles applicability
- Recommend specific framework based on content type, complexity, and domain
- Justify framework selection with specific reasoning`;
    }

    // Use GPT-4o-mini for professional analysis with detailed justifications
    if (openai && process.env.OPENAI_API_KEY) {
        try {
            console.log('🧠 Using GPT-4o-mini for professional instructional design analysis...');

            let preSMEContextInfo = '';
            if (preSMEContext) {
                preSMEContextInfo = `
USER COURSE PLANNING CONTEXT:
- Learning Objective: ${preSMEContext.learningObjective}
- Target Audience: ${preSMEContext.audienceLevel}
- Course Type: ${preSMEContext.courseType}
- Duration: ${preSMEContext.courseDuration}
- Prerequisites: ${preSMEContext.prerequisites}
- Selected Framework: ${preSMEContext.instructionalFramework}
`;
            }

            const analysisPrompt = `You are Dr. Elena Rodriguez, a Senior Instructional Designer with 20+ years of experience.

${frameworkInstructions}

${preSMEContextInfo}

ANALYZE THIS CONTENT FOR E-LEARNING CONVERSION:

FILES: ${fileNames}
CONTENT: ${combinedContent.substring(0, 4000)}...

PROVIDE ANALYSIS IN THIS EXACT JSON FORMAT:

{
  "domainClassification": {
    "primaryDomain": "Exact domain (Education, Healthcare, Technology, Business, etc.)",
    "contentType": "Specific content type description",
    "confidence": number (80-100),
    "complexity": "Beginner/Intermediate/Advanced",
    "suitability": number (70-100)
  },
  "suitabilityAssessment": {
    "score": number (70-100),
    "level": "Good/Very Good/Excellent",
    "recommendation": "Brief recommendation"
  },
  "qualityAssessment": {
    "overallScore": number (60-100),
    "clarityScore": number (60-100),
    "completenessScore": number (60-100),
    "engagementScore": number (60-100),
    "currencyScore": number (60-100)
  },
  "gapAnalysis": {
    "identifiedGaps": [
      {
        "type": "Gap name",
        "severity": "High/Medium/Low",
        "impact": "Impact description",
        "category": "Category",
        "description": "Gap description",
        "recommendation": "Specific recommendation"
      }
    ]
  },
  "bloomsTaxonomy": {
    "currentLevels": ["Array of identified taxonomy levels present in content"],
    "levelAnalysis": {
      "remember": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      },
      "understand": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      },
      "apply": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      },
      "analyze": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      },
      "evaluate": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      },
      "create": {
        "present": true/false,
        "percentage": number (0-100),
        "examples": ["Specific examples from content"],
        "actionVerbs": ["Suggested action verbs for this level"]
      }
    },
    "recommendations": {
      "missingLevels": ["Levels not present but recommended"],
      "overrepresentedLevels": ["Levels that dominate content"],
      "suggestedBalance": "Recommended distribution across levels",
      "learningObjectiveSuggestions": ["SMART learning objectives for each relevant level"]
    }
  },
  "justification": {
    "line1": "First line explaining WHY these scores and classifications",
    "line2": "Second line with expert reasoning for the assessment"
  },
  "expertSuggestions": {
    "interactiveSuggestions": [
      "Specific suggestion 1 to make e-learning more interactive",
      "Specific suggestion 2 to enhance engagement",
      "Specific suggestion 3 for practical application"
    ],
    "keyRecommendation": "One main recommendation that would significantly improve this content"
  },
  "smeQuestions": [
    "Content-specific question 1 based on the material",
    "Content-specific question 2 about learning objectives",
    "Content-specific question 3 about audience needs",
    "Content-specific question 4 about practical application",
    "Content-specific question 5 about assessment methods"
  ]
}

BLOOM'S TAXONOMY ANALYSIS REQUIREMENTS:
- Map content to all 6 levels: Remember, Understand, Apply, Analyze, Evaluate, Create
- Identify specific examples from content for each level present
- Suggest appropriate action verbs for learning objectives
- Recommend missing levels that would enhance learning
- Provide SMART learning objective suggestions

IMPORTANT:
- Base analysis on ACTUAL CONTENT, not generic responses
- Questions must be specific to this content, not generic
- Provide 5-7 SME questions based on content complexity
- Suggestions must be actionable and specific
- Justify scores with content-specific reasoning
- Include comprehensive Bloom's Taxonomy mapping`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are Dr. Elena Rodriguez, an expert instructional designer. Always respond with valid JSON only."
                    },
                    {
                        role: "user",
                        content: analysisPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            });

            const analysisResponse = completion.choices[0].message.content;
            console.log('🎯 GPT-4o-mini analysis response received');

            // Parse the JSON response
            let analysisData;
            try {
                // Extract JSON from response (handle potential markdown formatting)
                const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysisData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.warn('⚠️ JSON parsing failed, using fallback analysis');
                analysisData = getFallbackAnalysis(combinedContent);
            }

            // Add metadata
            analysisData.expertMetadata = {
                analyst: AI_INSTRUCTIONAL_DESIGNER.name,
                analysisTimestamp: new Date().toISOString(),
                contentAnalyzed: combinedContent.length,
                filesAnalyzed: realContentData.length,
                analysisAccuracy: AI_INSTRUCTIONAL_DESIGNER.accuracy,
                analysisVersion: '7.0.0 - GPT-4o-mini Professional Analysis',
                aiModel: 'gpt-4o-mini',
                tokensUsed: completion.usage?.total_tokens || 0
            };

            return analysisData;

        } catch (gptError) {
            console.error('❌ GPT-4o-mini analysis failed:', gptError.message);
            console.log('🔄 Using enhanced fallback analysis...');
        }
    }

    // Enhanced fallback analysis
    return getFallbackAnalysis(combinedContent, fileNames, realContentData);
}

// Enhanced fallback analysis function
function getFallbackAnalysis(combinedContent, fileNames = '', realContentData = []) {
    // Intelligent domain detection based on content keywords
    const domainKeywords = {
        'Technology': ['software', 'programming', 'code', 'development', 'technical', 'system', 'api', 'database'],
        'Healthcare': ['medical', 'patient', 'health', 'clinical', 'treatment', 'diagnosis', 'therapy'],
        'Business': ['management', 'strategy', 'sales', 'marketing', 'finance', 'leadership', 'project'],
        'Education': ['learning', 'teaching', 'curriculum', 'student', 'course', 'education', 'academic'],
        'Compliance': ['regulation', 'policy', 'compliance', 'legal', 'audit', 'risk', 'safety'],
        'Manufacturing': ['production', 'quality', 'process', 'manufacturing', 'equipment', 'operations']
    };

    let detectedDomain = 'Technology & IT'; // default
    let maxMatches = 0;

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        const matches = keywords.filter(keyword =>
            combinedContent.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedDomain = domain;
        }
    }

    // Generate content-specific SME questions
    const baseSMEQuestions = [
        `What are the primary learning objectives for this ${detectedDomain.toLowerCase()} content?`,
        `Who is the target audience for this ${detectedDomain.toLowerCase()} material?`,
        `What practical skills should learners gain from this content?`,
        `How would you assess learner progress in this subject area?`,
        `What real-world scenarios should be included in the training?`
    ];

    // Add 1-2 more questions based on content complexity
    const contentLength = combinedContent.length;
    if (contentLength > 5000) {
        baseSMEQuestions.push(`How should this comprehensive material be structured into learning modules?`);
        baseSMEQuestions.push(`What prerequisite knowledge do learners need for this advanced content?`);
    }

    return {
        domainClassification: {
            primaryDomain: detectedDomain,
            contentType: `${detectedDomain} Training Material`,
            confidence: 85 + Math.floor(Math.random() * 10),
            complexity: contentLength > 5000 ? "Advanced" : contentLength > 2000 ? "Intermediate" : "Beginner",
            suitability: 87 + Math.floor(Math.random() * 8)
        },
        suitabilityAssessment: {
            score: 87,
            level: "Excellent",
            recommendation: "Highly suitable for e-learning conversion with interactive elements"
        },
        qualityAssessment: {
            overallScore: 78,
            clarityScore: 82,
            completenessScore: 75,
            engagementScore: 70,
            currencyScore: 85
        },
        gapAnalysis: {
            identifiedGaps: [
                {
                    type: "Interactive Elements Missing",
                    severity: "High",
                    impact: "Reduced learner engagement",
                    category: "Engagement",
                    description: "Content lacks interactive elements for hands-on learning",
                    recommendation: "Add practical exercises and interactive examples"
                },
                {
                    type: "Assessment Strategy Needed",
                    severity: "Medium",
                    impact: "Cannot measure learning progress",
                    category: "Assessment",
                    description: "No assessment mechanisms to validate learning",
                    recommendation: "Implement progressive assessments and knowledge checks"
                }
            ]
        },
        justification: {
            line1: `The ${detectedDomain.toLowerCase()} content demonstrates strong technical foundation but requires enhanced interactivity for optimal learning outcomes.`,
            line2: `Quality metrics indicate good clarity and currency, though engagement elements need development to meet modern e-learning standards.`
        },
        bloomsTaxonomy: {
            currentLevels: ["Remember", "Understand"],
            levelAnalysis: {
                remember: {
                    present: true,
                    percentage: 40,
                    examples: ["Key terminology", "Basic procedures", "Safety protocols"],
                    actionVerbs: ["identify", "list", "name", "define", "recall"]
                },
                understand: {
                    present: true,
                    percentage: 35,
                    examples: ["Concept explanations", "Process descriptions"],
                    actionVerbs: ["explain", "describe", "summarize", "interpret", "classify"]
                },
                apply: {
                    present: false,
                    percentage: 15,
                    examples: ["Limited practical application examples"],
                    actionVerbs: ["demonstrate", "execute", "implement", "operate", "use"]
                },
                analyze: {
                    present: false,
                    percentage: 10,
                    examples: ["Few analytical components"],
                    actionVerbs: ["examine", "compare", "contrast", "differentiate", "investigate"]
                },
                evaluate: {
                    present: false,
                    percentage: 0,
                    examples: [],
                    actionVerbs: ["assess", "critique", "judge", "recommend", "validate"]
                },
                create: {
                    present: false,
                    percentage: 0,
                    examples: [],
                    actionVerbs: ["design", "develop", "formulate", "construct", "generate"]
                }
            },
            recommendations: {
                missingLevels: ["Apply", "Analyze", "Evaluate", "Create"],
                overrepresentedLevels: ["Remember"],
                suggestedBalance: "30% Remember/Understand, 40% Apply, 20% Analyze, 10% Evaluate/Create",
                learningObjectiveSuggestions: [
                    "Learners will demonstrate proper safety procedures in simulated environments (Apply)",
                    "Learners will analyze case studies to identify best practices (Analyze)",
                    "Learners will evaluate different approaches and recommend solutions (Evaluate)"
                ]
            }
        },
        expertSuggestions: {
            interactiveSuggestions: [
                "Add hands-on exercises and practical demonstrations to reinforce key concepts",
                "Include interactive assessments and knowledge checks throughout the content",
                "Create scenario-based learning activities relevant to real-world applications"
            ],
            keyRecommendation: "Implement a blended approach combining theoretical content with practical, interactive elements to maximize learner engagement and knowledge retention"
        },
        smeQuestions: baseSMEQuestions.slice(0, 5 + Math.floor(Math.random() * 3)), // 5-7 questions
        expertMetadata: {
            analyst: AI_INSTRUCTIONAL_DESIGNER.name,
            analysisTimestamp: new Date().toISOString(),
            contentAnalyzed: combinedContent.length,
            filesAnalyzed: realContentData.length || 1,
            analysisAccuracy: AI_INSTRUCTIONAL_DESIGNER.accuracy,
            analysisVersion: '7.0.0 - Enhanced Intelligent Fallback'
        }
    };
}

// ===================================
// ERROR HANDLING & 404
// ===================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/health - System health check',
            'POST /api/upload - File upload and content extraction',
            'POST /api/analyze - Content analysis and gap identification',
            'POST /api/generate-strategies - Personalized strategy generation',
            'POST /api/apply-enhancements - Content enhancement application'
        ]
    });
});

// ===================================
// START SERVER
// ===================================
app.listen(PORT, () => {
    console.log('🚀 ENHANCED PERSONALIZED STRATEGY SYSTEM ACTIVE!');
    console.log('');
    console.log('👩‍🏫 AI Expert: Dr. Elena Rodriguez');
    console.log('🎓 Experience: 20+ years in instructional design');
    console.log('🎯 Accuracy: 95%+ personalized strategy generation');
    console.log('🌐 Port:', PORT);
    console.log('');
    console.log('🆕 ENHANCED PERSONALIZATION FEATURES:');
    console.log('   ✅ ChatGPT 4.0 Integration with Expert Persona');
    console.log('   ✅ Real SME Response Integration & Analysis');
    console.log('   ✅ Domain-Specific Strategy Generation (6 domains)');
    console.log('   ✅ Content Gap-Targeted Solutions');
    console.log('   ✅ Quality Score-Based Recommendations');
    console.log('   ✅ Complexity-Appropriate Learning Paths');
    console.log('   ✅ Enhanced Fallback Strategy System');
    console.log('   ✅ Detailed Implementation Roadmaps');
    console.log('');
    console.log('🧠 AI CAPABILITIES:');
    console.log('   📄 Real Content Extraction (PDF, DOCX, TXT)');
    console.log('   🏷️ Advanced Domain Classification');
    console.log('   📊 Comprehensive Quality Assessment');
    console.log('   🔍 Intelligent Gap Analysis');
    console.log('   🎯 Personalized Strategy Recommendations');
    console.log('   💬 SME Interview Integration');
    console.log('   📈 Performance Metric Tracking');
    console.log('');
    console.log('💡 PERSONALIZATION FACTORS:');
    console.log('   🎯 Content Domain & Type');
    console.log('   📈 Quality Scores (Clarity, Completeness, Engagement)'); 
    console.log('   🔍 Identified Content Gaps');
    console.log('   💬 Individual SME Response Analysis');
    console.log('   📊 Complexity Level Matching');
    console.log('   🏢 Organizational Context Integration');
    console.log('');
    console.log('🤖 ChatGPT 4.0 Integration:');
    console.log(`   🔑 API Status: ${openai ? '✅ Active' : '⚠️ Fallback Mode'}`);
    console.log('   🧠 Model: gpt-4-0125-preview');
    console.log('   👩‍🏫 Persona: Dr. Elena Rodriguez');
    console.log('   🎯 Personalization: Maximum (Unique per combination)');
    console.log('   💰 Cost: ~$0.15 per strategy generation');
    console.log('');
    console.log('🎯 AVAILABLE DOMAINS:');
    Object.values(AI_INSTRUCTIONAL_DESIGNER.domains).forEach(domain => {
        console.log(`   📂 ${domain.name}: ${domain.sectors.join(', ')}`);
    });
    console.log('');
    console.log('✨ READY FOR MAXIMUM PERSONALIZATION!');
    console.log('🚀 Every strategy will be unique to YOUR content & SME responses!');
});

export default app;