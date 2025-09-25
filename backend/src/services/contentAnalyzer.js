import OpenAI from 'openai';
import { log } from '../utils/logger.js';
import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class EnhancedContentAnalyzer {
  constructor() {
    this.analysisCache = new Map();
  }

  // Main content analysis method that integrates with your UI
  async analyzeUploadedContent(files) {
    try {
      log.info(`Starting enhanced content analysis for ${files.length} files`);

      const analysisResults = {
        sessionId: Date.now().toString(),
        analyzedAt: new Date().toISOString(),
        totalFiles: files.length,
        fileAnalyses: [],
        crossAnalysis: {},
        learningInsights: {},
        smePreparationData: {}
      };

      // Step 1: Analyze each file individually
      for (const file of files) {
        try {
          log.info(`Analyzing file: ${file.originalName}`);

          const fileContent = await this.extractFileContent(file);
          const fileAnalysis = await this.analyzeSingleFile(fileContent, file);

          analysisResults.fileAnalyses.push({
            fileId: file.id,
            fileName: file.originalName,
            fileType: file.mimetype,
            analysis: fileAnalysis,
            contentLength: fileContent.length
          });

        } catch (error) {
          log.error(`Failed to analyze ${file.originalName}:`, error);
          analysisResults.fileAnalyses.push({
            fileId: file.id,
            fileName: file.originalName,
            error: error.message
          });
        }
      }

      // Step 2: Perform cross-file analysis
      analysisResults.crossAnalysis = await this.performCrossAnalysis(analysisResults.fileAnalyses);

      // Step 3: Generate learning insights
      analysisResults.learningInsights = await this.generateLearningInsights(
        analysisResults.fileAnalyses,
        analysisResults.crossAnalysis
      );

      // Step 4: Prepare data for SME question generation
      analysisResults.smePreparationData = this.prepareSMEData(analysisResults);

      log.info('Enhanced content analysis completed successfully');
      return analysisResults;

    } catch (error) {
      log.error('Enhanced content analysis failed:', error);
      throw new Error(`Content analysis failed: ${error.message}`);
    }
  }

  // Extract content from various file types
  async extractFileContent(file) {
    try {
      const fileExtension = path.extname(file.originalName || file.filename).toLowerCase();
      const filePath = file.path;

      switch (fileExtension) {
        case '.pdf':
          const pdfBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(pdfBuffer);
          return pdfData.text;

        case '.txt':
          return fs.readFileSync(filePath, 'utf8');

        case '.docx':
        case '.doc':
          // For now, return placeholder - implement with mammoth.js
          return `[Word document content from ${file.originalName} would be extracted here]`;

        case '.pptx':
        case '.ppt':
          // For now, return placeholder - implement with appropriate library
          return `[PowerPoint content from ${file.originalName} would be extracted here]`;

        default:
          return `[Content extraction for ${fileExtension} files not yet implemented]`;
      }
    } catch (error) {
      log.error(`Content extraction failed for ${file.originalName}:`, error);
      throw error;
    }
  }

  // Analyze individual file with ChatGPT-4o-mini
  async analyzeSingleFile(content, fileInfo) {
    const systemPrompt = `You are an expert instructional designer analyzing educational content. Provide detailed analysis for e-learning conversion.`;

    const userPrompt = `Analyze this educational content from "${fileInfo.originalName}":

Content: ${content.substring(0, 3000)}...

Provide detailed analysis in JSON format:
{
  "contentOverview": {
    "primarySubject": "main topic",
    "contentType": "training|reference|procedure|concept|case_study",
    "targetAudience": "inferred audience",
    "complexity": "beginner|intermediate|advanced",
    "estimatedReadingTime": "minutes"
  },
  "learningElements": {
    "keyTopics": ["main topics covered"],
    "learningObjectives": ["potential learning objectives"],
    "criticalConcepts": ["must-understand concepts"],
    "practicalApplications": ["how this applies in practice"],
    "prerequisites": ["assumed prior knowledge"]
  },
  "instructionalOpportunities": {
    "interactionPoints": ["where interactions could be added"],
    "assessmentOpportunities": ["where assessments would fit"],
    "multiMediaPotential": ["content suitable for visuals/video"],
    "scenarioBasedLearning": ["real-world scenario opportunities"]
  },
  "conversionReadiness": {
    "structureClarity": "high|medium|low",
    "conceptualDepth": "high|medium|low", 
    "practicalRelevance": "high|medium|low",
    "engagementPotential": "high|medium|low"
  },
  "identifiedGaps": [
    {
      "gapType": "content|assessment|interaction|example",
      "description": "what's missing",
      "priority": "high|medium|low"
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      log.error(`Single file analysis failed for ${fileInfo.originalName}:`, error);
      return this.getBasicAnalysis(fileInfo);
    }
  }

  // Cross-analyze multiple files for comprehensive insights
  async performCrossAnalysis(fileAnalyses) {
    const validAnalyses = fileAnalyses.filter(fa => fa.analysis && !fa.error);

    if (validAnalyses.length === 0) {
      return { error: 'No valid file analyses available for cross-analysis' };
    }

    const systemPrompt = `You are an expert instructional designer performing cross-content analysis to identify relationships, gaps, and course structure opportunities.`;

    const userPrompt = `Analyze these multiple files together to identify learning design opportunities:

Files Analyzed: ${JSON.stringify(validAnalyses.map(fa => ({
      fileName: fa.fileName,
      fileType: fa.fileType,
      analysis: fa.analysis
    })), null, 2)}

Provide cross-analysis in JSON format:
{
  "contentRelationships": {
    "complementaryTopics": ["topics that work well together"],
    "prerequisiteChain": ["logical learning sequence"],
    "overlappingConcepts": ["concepts covered in multiple files"],
    "conflictingInformation": ["any contradictions found"]
  },
  "courseStructurePotential": {
    "suggestedModules": [
      {
        "moduleTitle": "suggested name",
        "filesIncluded": ["which files"],
        "learningObjectives": ["objectives for this module"],
        "estimatedDuration": "time estimate"
      }
    ],
    "overallDuration": "total course estimate",
    "difficultyProgression": "how complexity should build"
  },
  "identifiedGaps": {
    "contentGaps": ["missing topics or explanations"],
    "assessmentGaps": ["where evaluations are needed"],
    "engagementGaps": ["where interactivity is needed"],
    "supportGaps": ["where additional resources are needed"]
  }
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      log.error('Cross-analysis failed:', error);
      return this.getBasicCrossAnalysis(validAnalyses);
    }
  }

  // Generate learning insights for SME preparation
  async generateLearningInsights(fileAnalyses, crossAnalysis) {
    return {
      overallReadiness: this.calculateReadiness(fileAnalyses),
      priorityAreas: this.identifyPriorityAreas(fileAnalyses, crossAnalysis),
      learnerConsiderations: this.analyzeLearnerNeeds(fileAnalyses),
      implementationRecommendations: this.getImplementationRecommendations(crossAnalysis)
    };
  }

  // Prepare data specifically for SME question generation
  prepareSMEData(analysisResults) {
    return {
      contentProfile: {
        totalFiles: analysisResults.totalFiles,
        primaryTopics: this.extractPrimaryTopics(analysisResults.fileAnalyses),
        complexitySpread: this.analyzeComplexitySpread(analysisResults.fileAnalyses),
        contentTypes: this.categorizeContentTypes(analysisResults.fileAnalyses)
      },
      questioningFocus: this.determineQuestioningFocus(analysisResults),
      contextualElements: this.extractContextualElements(analysisResults)
    };
  }

  // Helper methods
  getBasicAnalysis(fileInfo) {
    return {
      contentOverview: {
        primarySubject: "Content analysis pending",
        contentType: "training",
        complexity: "intermediate",
        estimatedReadingTime: "15"
      },
      learningElements: {
        keyTopics: [`Content from ${fileInfo.originalName}`],
        learningObjectives: ["To be determined through SME interview"],
        criticalConcepts: ["Analysis in progress"],
        practicalApplications: ["To be identified"],
        prerequisites: ["To be determined"]
      }
    };
  }

  getBasicCrossAnalysis(analyses) {
    return {
      contentRelationships: {
        complementaryTopics: [`Topics from ${analyses.length} uploaded files`],
        prerequisiteChain: ["Sequence to be determined through SME input"],
        overlappingConcepts: ["To be identified"],
        conflictingInformation: []
      },
      courseStructurePotential: {
        suggestedModules: [{
          moduleTitle: "Main Content Module",
          filesIncluded: analyses.map(a => a.fileName),
          learningObjectives: ["To be defined with SME"],
          estimatedDuration: "45-60 minutes"
        }]
      }
    };
  }

  calculateReadiness(fileAnalyses) {
    // Basic readiness calculation
    const validAnalyses = fileAnalyses.filter(fa => fa.analysis && !fa.error);
    return {
      score: Math.min(90, validAnalyses.length * 20),
      factors: ['Content extracted', 'Structure analyzed', 'Ready for SME input']
    };
  }

  identifyPriorityAreas(fileAnalyses, crossAnalysis) {
    return [
      'Learning objectives clarification',
      'Content sequencing and structure',
      'Assessment strategy design',
      'Learner engagement planning'
    ];
  }

  analyzeLearnerNeeds(fileAnalyses) {
    return {
      supportNeeds: ['Prerequisites clarification', 'Practice opportunities'],
      assessmentTypes: ['Formative', 'Practical application'],
      engagementStrategies: ['Interactive elements', 'Real-world scenarios']
    };
  }

  getImplementationRecommendations(crossAnalysis) {
    return {
      courseStructure: 'Modular approach recommended',
      deliveryMethod: 'Blended learning with interactive elements',
      timeCommitment: '45-90 minutes total',
      supportResources: 'Job aids and reference materials'
    };
  }

  extractPrimaryTopics(fileAnalyses) {
    const topics = [];
    fileAnalyses.forEach(fa => {
      if (fa.analysis?.learningElements?.keyTopics) {
        topics.push(...fa.analysis.learningElements.keyTopics);
      }
    });
    return [...new Set(topics)];
  }

  analyzeComplexitySpread(fileAnalyses) {
    const complexities = fileAnalyses
      .map(fa => fa.analysis?.contentOverview?.complexity)
      .filter(Boolean);
    return [...new Set(complexities)];
  }

  categorizeContentTypes(fileAnalyses) {
    const types = fileAnalyses
      .map(fa => fa.analysis?.contentOverview?.contentType)
      .filter(Boolean);
    return [...new Set(types)];
  }

  determineQuestioningFocus(analysisResults) {
    return {
      primaryFocus: 'Learning objectives and outcomes',
      secondaryFocus: 'Content structure and sequencing',
      specialConsiderations: 'Assessment and engagement strategies'
    };
  }

  extractContextualElements(analysisResults) {
    return {
      fileTypes: analysisResults.fileAnalyses.map(fa => fa.fileType),
      contentScope: `${analysisResults.totalFiles} file(s) covering various topics`,
      analysisTimestamp: analysisResults.analyzedAt
    };
  }
}

export default EnhancedContentAnalyzer;
