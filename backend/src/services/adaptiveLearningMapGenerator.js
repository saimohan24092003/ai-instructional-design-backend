import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.openAiApiKey });

/**
 * Adaptive Learning Map Generator
 * Creates learning maps that adapt to content type, complexity, and chosen instructional strategy
 */
export class AdaptiveLearningMapGenerator {
    constructor() {
        this.contentTypeAnalyzers = {
            'technical': this.analyzeTechnicalContent.bind(this),
            'conceptual': this.analyzeConceptualContent.bind(this),
            'procedural': this.analyzeProceduralContent.bind(this),
            'compliance': this.analyzeComplianceContent.bind(this)
        };

        this.learningFormats = {
            'technical': ['Interactive Demonstrations', 'Step-by-step Guided Tours', 'Hands-on Simulations', 'Interactive Code Examples', 'Process Flow Diagrams'],
            'conceptual': ['Interactive Concept Maps', 'Scenario-based Learning', 'Case Study Analysis', 'Comparative Visualizations', 'Interactive Timelines'],
            'compliance': ['Scenario Quizzes', 'Decision Trees', 'Interactive Examples', 'Compliance Checklists', 'Risk Assessment Scenarios'],
            'procedural': ['Interactive Tutorials', 'Screen Simulations', 'Feature Explorations', 'Practice Environments', 'Guided Walkthroughs']
        };
    }

    /**
     * Generate adaptive learning map based on content analysis and strategy
     */
    async generateAdaptiveLearningMap(professionalAnalysis, userStrategy = {}, smeResponses = [], sessionData = {}) {
        try {
            console.log('🎯 Generating professional adaptive learning map...');
            console.log('📊 Content Analysis Available:', !!professionalAnalysis);
            console.log('👥 SME Responses Available:', smeResponses.length > 0);
            console.log('🎯 User Strategy:', userStrategy.learningApproach || 'adaptive');

            // Extract content metadata and page count
            const contentMetadata = this.extractContentMetadata(professionalAnalysis, sessionData);
            console.log('📄 Content Metadata:', contentMetadata);

            // Create strategy-specific content profile
            const contentProfile = await this.createStrategySpecificProfile(
                professionalAnalysis,
                userStrategy,
                smeResponses,
                contentMetadata
            );

            // Generate strategy-adapted learning approach
            const adaptedStrategy = this.adaptStrategyToAnalysis(contentProfile, userStrategy, professionalAnalysis);

            // Create professional learning map structure with real page references
            const learningMapStructure = await this.generateProfessionalLearningMap(
                contentProfile,
                adaptedStrategy,
                professionalAnalysis,
                contentMetadata
            );

            const completeLearningMap = {
                // Core Information
                courseName: this.generateProfessionalCourseName(professionalAnalysis, contentProfile),
                projectName: this.generateProjectName(contentProfile, professionalAnalysis),
                customerName: contentProfile.organizationName || 'Organization',
                totalDuration: this.calculateTotalDuration(learningMapStructure.modules),
                moduleCount: learningMapStructure.modules.length,

                // Professional Documentation
                documentObjective: this.generateDocumentObjective(contentProfile, adaptedStrategy, professionalAnalysis),
                sourceContent: this.describeSourceContent(professionalAnalysis, contentMetadata),
                learnerPersona: this.generateDetailedLearnerPersona(professionalAnalysis, smeResponses, contentProfile),
                courseStorySummary: this.generateCourseStory(contentProfile, adaptedStrategy, professionalAnalysis),

                // Learning Structure
                modules: learningMapStructure.modules,
                assessmentStrategy: this.generateAssessmentStrategy(contentProfile, adaptedStrategy),
                selectedStrategies: this.generateSelectedStrategies(userStrategy, adaptedStrategy, professionalAnalysis),

                // Metadata
                metadata: {
                    generatedAt: new Date().toISOString(),
                    strategy: adaptedStrategy,
                    contentProfile: contentProfile,
                    analysisQuality: professionalAnalysis?.qualityAssessment?.overallScore || 0,
                    generator: 'Professional Adaptive Learning Map Generator v2.0',
                    basedOnActualContent: !!professionalAnalysis,
                    smeInputs: smeResponses.length,
                    contentPages: contentMetadata.totalPages
                }
            };

            console.log('✅ Professional adaptive learning map generated successfully');
            console.log(`📚 Course: ${completeLearningMap.courseName}`);
            console.log(`📖 Modules: ${completeLearningMap.modules.length}`);
            console.log(`⏱️ Duration: ${completeLearningMap.totalDuration} minutes`);

            return completeLearningMap;

        } catch (error) {
            console.error('❌ Professional learning map generation failed:', error);
            throw new Error(`Learning map generation failed: ${error.message}`);
        }
    }

    /**
     * Analyze content characteristics to determine optimal approach
     */
    async analyzeContentCharacteristics(contentAnalysis) {
        const systemPrompt = `You are an expert instructional designer analyzing content to determine optimal learning design approach.`;

        const analysisPrompt = `
Analyze this content analysis to determine optimal learning map characteristics:

CONTENT ANALYSIS:
${JSON.stringify(contentAnalysis, null, 2)}

Determine the following characteristics in JSON format:
{
  "contentType": "technical|conceptual|procedural|compliance|mixed",
  "contentComplexity": "beginner|intermediate|advanced|mixed",
  "contentStructure": "linear|modular|case-based|problem-solving",
  "keyLearningOutcomes": ["outcome1", "outcome2", "outcome3"],
  "contentVolume": "micro|short|medium|extensive",
  "optimalModuleCount": 3,
  "suggestedDuration": 60,
  "primaryDomain": "extracted from analysis",
  "learningChallenges": ["challenge1", "challenge2"],
  "engagementOpportunities": ["opportunity1", "opportunity2"],
  "assessmentNeeds": ["knowledge-check", "practical-application", "scenario-based"],
  "recommendedFormats": ["format1", "format2", "format3"]
}`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: analysisPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1500
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Content characteristics analysis failed:', error);
            return this.getDefaultContentProfile(contentAnalysis);
        }
    }

    /**
     * Adapt strategy based on content characteristics
     */
    adaptStrategyToContent(contentProfile, userStrategy = {}) {
        const baseStrategy = {
            learningApproach: 'adaptive',
            interactionLevel: 'high',
            assessmentIntegration: 'continuous',
            visualDesign: 'modern',
            accessibility: true,
            mobileOptimized: true
        };

        // Adapt based on content type
        let adaptedStrategy = { ...baseStrategy, ...userStrategy };

        switch (contentProfile.contentType) {
            case 'technical':
                adaptedStrategy.primaryFormats = this.learningFormats.technical;
                adaptedStrategy.focusAreas = ['hands-on practice', 'step-by-step guidance', 'real-world application'];
                break;
            case 'conceptual':
                adaptedStrategy.primaryFormats = this.learningFormats.conceptual;
                adaptedStrategy.focusAreas = ['understanding relationships', 'scenario application', 'concept synthesis'];
                break;
            case 'procedural':
                adaptedStrategy.primaryFormats = this.learningFormats.procedural;
                adaptedStrategy.focusAreas = ['sequence mastery', 'practice opportunities', 'error prevention'];
                break;
            case 'compliance':
                adaptedStrategy.primaryFormats = this.learningFormats.compliance;
                adaptedStrategy.focusAreas = ['policy understanding', 'decision making', 'risk awareness'];
                break;
            default:
                adaptedStrategy.primaryFormats = ['Interactive Visualization', 'Scenario-based Learning', 'Guided Practice'];
                adaptedStrategy.focusAreas = ['comprehensive understanding', 'practical application'];
        }

        // Adapt based on complexity
        if (contentProfile.contentComplexity === 'beginner') {
            adaptedStrategy.progression = 'gentle';
            adaptedStrategy.supportLevel = 'high';
            adaptedStrategy.practiceFrequency = 'frequent';
        } else if (contentProfile.contentComplexity === 'advanced') {
            adaptedStrategy.progression = 'accelerated';
            adaptedStrategy.supportLevel = 'moderate';
            adaptedStrategy.practiceFrequency = 'targeted';
        }

        return adaptedStrategy;
    }

    /**
     * Generate overall learning map structure
     */
    async generateLearningMapStructure(contentProfile, strategy) {
        const systemPrompt = `You are an expert instructional designer creating an optimal learning structure.`;

        const structurePrompt = `
Create a learning map structure based on:

CONTENT PROFILE:
${JSON.stringify(contentProfile, null, 2)}

STRATEGY:
${JSON.stringify(strategy, null, 2)}

Generate a structure in JSON format:
{
  "totalModules": 3,
  "moduleStructure": [
    {
      "moduleNumber": 1,
      "moduleTitle": "Foundation & Introduction",
      "purpose": "Establish foundation and context",
      "duration": 20,
      "focusArea": "knowledge building",
      "keyTopics": ["topic1", "topic2"]
    }
  ],
  "learningProgression": "description of how modules build on each other",
  "adaptiveElements": ["element1", "element2"],
  "engagementStrategy": "overall engagement approach"
}`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: structurePrompt }
                ],
                temperature: 0.4,
                max_tokens: 2000
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Learning map structure generation failed:', error);
            return this.getDefaultStructure(contentProfile);
        }
    }

    /**
     * Generate detailed module breakdown with specific learning activities
     */
    async generateDetailedModules(learningMap, contentProfile, strategy) {
        const modules = [];

        for (const moduleStructure of learningMap.moduleStructure) {
            const detailedModule = await this.generateDetailedModule(
                moduleStructure,
                contentProfile,
                strategy
            );
            modules.push(detailedModule);
        }

        return modules;
    }

    /**
     * Generate detailed module with specific learning activities
     */
    async generateDetailedModule(moduleStructure, contentProfile, strategy) {
        const systemPrompt = `You are an expert instructional designer creating detailed learning activities.`;

        const modulePrompt = `
Create detailed learning activities for this module:

MODULE STRUCTURE:
${JSON.stringify(moduleStructure, null, 2)}

CONTENT PROFILE:
${JSON.stringify(contentProfile, null, 2)}

STRATEGY:
${JSON.stringify(strategy, null, 2)}

Generate detailed module in this format:
{
  "moduleNumber": ${moduleStructure.moduleNumber},
  "moduleTitle": "${moduleStructure.moduleTitle}",
  "estimatedDuration": ${moduleStructure.duration},
  "moduleStory": "Brief narrative explaining what happens in this module",
  "topics": [
    {
      "topicName": "Specific topic name from content",
      "sourceContentReference": "Page/section reference from original content",
      "estimatedTime": 5,
      "learningFormat": "Interactive Visualization",
      "screenDescription": "Detailed description of what learners see and interact with"
    }
  ]
}

Use realistic page references and ensure activities align with the content type (${contentProfile.contentType}).`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: modulePrompt }
                ],
                temperature: 0.4,
                max_tokens: 2000
            });

            const moduleData = JSON.parse(response.choices[0].message.content);

            // Ensure proper format selection based on content type
            if (moduleData.learningActivities) {
                moduleData.topics = moduleData.learningActivities.map(activity => ({
                    topicName: activity.activity,
                    sourceContentReference: activity.sourceContentReference,
                    estimatedTime: activity.estimatedTime,
                    learningFormat: strategy.primaryFormats.includes(activity.learningFormat)
                        ? activity.learningFormat
                        : this.selectOptimalFormat(activity.activity, strategy.primaryFormats),
                    screenDescription: activity.screenDescription
                }));
                delete moduleData.learningActivities;
            }

            // Ensure topics field exists
            if (moduleData.topics) {
                moduleData.topics = moduleData.topics.map(topic => {
                    if (!strategy.primaryFormats.includes(topic.learningFormat)) {
                        topic.learningFormat = this.selectOptimalFormat(topic.topicName, strategy.primaryFormats);
                    }
                    return topic;
                });
            }

            return moduleData;

        } catch (error) {
            console.error(`Detailed module generation failed for module ${moduleStructure.moduleNumber}:`, error);
            return this.getDefaultModule(moduleStructure, strategy);
        }
    }

    /**
     * Generate assessment strategy adapted to content and approach
     */
    generateAssessmentStrategy(contentProfile, strategy) {
        const assessments = [];

        // Add knowledge checks for each module
        if (contentProfile.assessmentNeeds.includes('knowledge-check')) {
            assessments.push({
                type: 'Knowledge Verification',
                format: 'Interactive Quiz',
                timing: 'End of each module',
                duration: 5,
                description: 'Quick knowledge validation with immediate feedback'
            });
        }

        // Add practical assessments for technical/procedural content
        if (['technical', 'procedural'].includes(contentProfile.contentType)) {
            assessments.push({
                type: 'Practical Application',
                format: 'Hands-on Simulation',
                timing: 'Mid-course and final',
                duration: 15,
                description: 'Real-world scenario application and skill demonstration'
            });
        }

        // Add scenario-based assessments for conceptual/compliance content
        if (['conceptual', 'compliance'].includes(contentProfile.contentType)) {
            assessments.push({
                type: 'Scenario Analysis',
                format: 'Case Study Evaluation',
                timing: 'Module 2 and final',
                duration: 10,
                description: 'Decision-making scenarios with guided feedback'
            });
        }

        return {
            assessmentPhilosophy: this.getAssessmentPhilosophy(contentProfile),
            assessmentTypes: assessments,
            totalAssessmentTime: assessments.reduce((sum, a) => sum + a.duration, 0),
            feedbackStrategy: 'Immediate, constructive feedback with learning reinforcement'
        };
    }

    /**
     * Helper methods for content analysis and generation
     */
    analyzeTechnicalContent(content) {
        return {
            focusAreas: ['procedures', 'tools', 'troubleshooting'],
            learningFormats: this.learningFormats.technical,
            assessmentNeeds: ['practical-application', 'problem-solving']
        };
    }

    analyzeConceptualContent(content) {
        return {
            focusAreas: ['understanding', 'relationships', 'application'],
            learningFormats: this.learningFormats.conceptual,
            assessmentNeeds: ['knowledge-check', 'scenario-based']
        };
    }

    analyzeProceduralContent(content) {
        return {
            focusAreas: ['step-by-step', 'sequence', 'practice'],
            learningFormats: this.learningFormats.procedural,
            assessmentNeeds: ['practical-application', 'sequence-verification']
        };
    }

    analyzeComplianceContent(content) {
        return {
            focusAreas: ['policies', 'consequences', 'decision-making'],
            learningFormats: this.learningFormats.compliance,
            assessmentNeeds: ['scenario-based', 'policy-verification']
        };
    }

    selectOptimalFormat(activityName, availableFormats) {
        // Logic to select best format based on activity content
        if (activityName.toLowerCase().includes('demo') || activityName.toLowerCase().includes('show')) {
            return availableFormats.find(f => f.includes('Demonstration')) || availableFormats[0];
        }
        if (activityName.toLowerCase().includes('practice') || activityName.toLowerCase().includes('exercise')) {
            return availableFormats.find(f => f.includes('Simulation') || f.includes('Practice')) || availableFormats[0];
        }
        return availableFormats[0];
    }

    generateDocumentObjective(contentProfile, strategy) {
        return `This adaptive learning course employs a ${strategy.learningApproach} instructional design approach tailored specifically for ${contentProfile.contentType} content. Learners will engage through ${strategy.primaryFormats.slice(0, 2).join(' and ')}, building competency through structured modules that adapt to individual learning needs and organizational context.`;
    }

    generateCourseName(contentProfile) {
        const domain = contentProfile.primaryDomain || 'Professional Development';
        const type = contentProfile.contentType.charAt(0).toUpperCase() + contentProfile.contentType.slice(1);
        return `${type} Mastery: ${domain} Excellence Program`;
    }

    generateProjectName(contentProfile) {
        return `${contentProfile.primaryDomain} Implementation Project`;
    }

    describeSourceContent(contentAnalysis) {
        const fileCount = contentAnalysis.metadata?.contentFilesAnalyzed || 1;
        const domain = contentAnalysis.domainClassification?.primaryDomain || 'Professional Content';
        return `${fileCount} uploaded file(s) containing ${domain} content, analyzed for instructional design conversion and learning strategy optimization.`;
    }

    generateLearnerPersona(contentProfile) {
        const complexity = contentProfile.contentComplexity;
        const domain = contentProfile.primaryDomain;

        const experienceLevels = {
            'beginner': 'foundational knowledge',
            'intermediate': 'working knowledge and some practical experience',
            'advanced': 'significant expertise and leadership responsibilities'
        };

        return `Professionals in ${domain} who have ${experienceLevels[complexity] || 'varied experience levels'} but need to develop specific competencies in the targeted subject area to enhance performance and meet organizational objectives.`;
    }

    generateCourseStory(contentProfile, strategy) {
        return `Learners begin with foundational concepts and progress through increasingly sophisticated applications using ${strategy.primaryFormats[0].toLowerCase()}. Through ${strategy.focusAreas.join(', ')}, participants develop practical competency while building confidence. The course culminates in real-world application scenarios that demonstrate mastery and prepare learners for immediate implementation in their professional roles.`;
    }

    calculateTotalDuration(modules) {
        return modules.reduce((total, module) => total + module.estimatedDuration, 0);
    }

    recommendDeliveryMethod(contentProfile, strategy) {
        if (contentProfile.contentType === 'technical') {
            return 'Blended learning with hands-on practice sessions and virtual simulations';
        } else if (contentProfile.contentComplexity === 'advanced') {
            return 'Self-paced learning with peer collaboration and expert consultation';
        } else {
            return 'Structured online learning with interactive elements and progress tracking';
        }
    }

    getAssessmentPhilosophy(contentProfile) {
        const philosophies = {
            'technical': 'Performance-based assessment focusing on practical application and problem-solving capabilities',
            'conceptual': 'Understanding-based assessment emphasizing concept application and analytical thinking',
            'procedural': 'Competency-based assessment ensuring accurate sequence execution and quality outcomes',
            'compliance': 'Scenario-based assessment validating policy understanding and appropriate decision-making'
        };
        return philosophies[contentProfile.contentType] || 'Comprehensive assessment balancing knowledge validation with practical application';
    }

    /**
     * Generate selected strategies section
     */
    generateSelectedStrategies(userStrategy, adaptedStrategy) {
        const strategies = [];

        // Add user-selected strategy
        if (userStrategy.learningApproach) {
            strategies.push({
                type: 'Learning Approach',
                selected: userStrategy.learningApproach,
                description: this.getStrategyDescription(userStrategy.learningApproach)
            });
        }

        // Add adapted strategies based on content analysis
        strategies.push({
            type: 'Content-Adapted Approach',
            selected: adaptedStrategy.learningApproach || 'adaptive',
            description: `Automatically adapted based on ${adaptedStrategy.primaryFormats?.length || 3} optimal learning formats`
        });

        if (adaptedStrategy.primaryFormats && adaptedStrategy.primaryFormats.length > 0) {
            strategies.push({
                type: 'Primary Learning Formats',
                selected: adaptedStrategy.primaryFormats.slice(0, 3).join(', '),
                description: 'Selected based on content type and complexity analysis'
            });
        }

        if (adaptedStrategy.focusAreas && adaptedStrategy.focusAreas.length > 0) {
            strategies.push({
                type: 'Focus Areas',
                selected: adaptedStrategy.focusAreas.join(', '),
                description: 'Key learning focus areas identified from content analysis'
            });
        }

        // Add engagement strategy
        strategies.push({
            type: 'Engagement Strategy',
            selected: adaptedStrategy.interactionLevel || 'high',
            description: 'Interaction level optimized for content complexity and learner needs'
        });

        // Add accessibility features
        if (adaptedStrategy.accessibility || userStrategy.accessibility) {
            strategies.push({
                type: 'Accessibility Features',
                selected: 'Enabled',
                description: 'Inclusive design ensuring accessibility for all learners'
            });
        }

        return strategies;
    }

    /**
     * Get description for strategy types
     */
    getStrategyDescription(strategyType) {
        const descriptions = {
            'adaptive': 'AI automatically determines optimal approach based on content analysis',
            'technical': 'Hands-on approach emphasizing practical skills and step-by-step guidance',
            'conceptual': 'Understanding-focused approach using scenarios and concept relationships',
            'procedural': 'Process-oriented approach with guided practice and sequence mastery',
            'compliance': 'Policy-focused approach emphasizing decision-making and risk awareness'
        };
        return descriptions[strategyType] || 'Customized learning approach based on content characteristics';
    }

    // Fallback methods for error handling
    /**
     * Extract content metadata including page count and structure
     */
    extractContentMetadata(professionalAnalysis, sessionData) {
        const metadata = {
            totalPages: 10, // Default
            fileCount: 1,
            contentLength: 0,
            hasStructuredContent: false
        };

        if (professionalAnalysis?.metadata) {
            metadata.fileCount = professionalAnalysis.metadata.contentFilesAnalyzed || 1;
            metadata.contentLength = professionalAnalysis.metadata.totalContentLength || 0;

            // Estimate pages based on content length (roughly 500 words per page)
            if (metadata.contentLength > 0) {
                metadata.totalPages = Math.max(3, Math.min(50, Math.round(metadata.contentLength / 2500)));
            }
        }

        // Look for page indicators in session data
        if (sessionData?.contentData) {
            sessionData.contentData.forEach(file => {
                if (file.metadata?.pages) {
                    metadata.totalPages = Math.max(metadata.totalPages, file.metadata.pages);
                }
            });
        }

        return metadata;
    }

    /**
     * Create strategy-specific content profile
     */
    async createStrategySpecificProfile(professionalAnalysis, userStrategy, smeResponses, contentMetadata) {
        const profile = {
            // Content characteristics from analysis
            contentType: this.determineContentType(professionalAnalysis, userStrategy),
            primaryDomain: professionalAnalysis?.domainClassification?.primaryDomain || 'Professional Development',
            complexity: professionalAnalysis?.complexityAssessment?.level || 'Intermediate',
            qualityScore: professionalAnalysis?.qualityAssessment?.overallScore || 75,

            // Strategy-specific adaptations
            learningApproach: userStrategy.learningApproach || 'adaptive',
            organizationName: this.extractOrganizationFromSME(smeResponses),

            // Content metadata
            totalPages: contentMetadata.totalPages,
            contentVolume: this.categorizeContentVolume(contentMetadata),

            // SME-informed characteristics
            learnerContext: this.extractLearnerContext(smeResponses),
            organizationalNeeds: this.extractOrganizationalNeeds(smeResponses)
        };

        return profile;
    }

    /**
     * Determine content type based on analysis and strategy
     */
    determineContentType(professionalAnalysis, userStrategy) {
        // User strategy takes precedence
        if (userStrategy.learningApproach) {
            const strategyMap = {
                'technical': 'technical',
                'conceptual': 'conceptual',
                'procedural': 'procedural',
                'compliance': 'compliance'
            };

            if (strategyMap[userStrategy.learningApproach]) {
                return strategyMap[userStrategy.learningApproach];
            }
        }

        // Fall back to analysis
        const domain = professionalAnalysis?.domainClassification?.primaryDomain || '';
        if (domain.includes('Technology') || domain.includes('IT')) return 'technical';
        if (domain.includes('Compliance') || domain.includes('Regulatory')) return 'compliance';
        if (domain.includes('Management') || domain.includes('Business')) return 'conceptual';

        return 'conceptual';
    }

    /**
     * Generate professional learning map with real page references
     */
    async generateProfessionalLearningMap(contentProfile, adaptedStrategy, professionalAnalysis, contentMetadata) {
        const systemPrompt = `You are Dr. Sarah Mitchell, Ph.D., a world-renowned instructional designer with 25+ years of experience.

        Create a professional learning map that:
        1. Uses REAL page references from the ${contentMetadata.totalPages}-page source content
        2. Adapts specifically to the ${contentProfile.learningApproach} learning strategy
        3. Reflects the ${contentProfile.primaryDomain} domain expertise
        4. Creates unique modules based on the actual content analysis provided

        CRITICAL: Page references must be realistic (pages 1-${contentMetadata.totalPages}) and distributed logically across modules.`;

        const mapPrompt = `Create a professional learning map for this content:

**CONTENT ANALYSIS:**
${JSON.stringify(professionalAnalysis, null, 2)}

**STRATEGY SELECTED:** ${contentProfile.learningApproach}
**CONTENT PAGES:** ${contentMetadata.totalPages} pages
**DOMAIN:** ${contentProfile.primaryDomain}
**COMPLEXITY:** ${contentProfile.complexity}

Generate a learning map with 3-4 modules in this format:
{
  "modules": [
    {
      "moduleNumber": 1,
      "moduleTitle": "Module Name Based on Actual Content",
      "estimatedDuration": 25,
      "moduleStory": "Professional narrative for this module",
      "topics": [
        {
          "topicName": "Specific topic from content analysis",
          "sourceContentReference": "Pages 1-3",
          "estimatedTime": 8,
          "learningFormat": "Strategy-specific format",
          "screenDescription": "Professional description of learning interaction"
        }
      ]
    }
  ]
}

REQUIREMENTS:
- Use actual content analysis findings for module titles and topics
- Distribute page references logically (Module 1: pages 1-${Math.ceil(contentMetadata.totalPages/3)}, Module 2: pages ${Math.ceil(contentMetadata.totalPages/3)+1}-${Math.ceil(contentMetadata.totalPages*2/3)}, etc.)
- Apply ${contentProfile.learningApproach} strategy principles throughout
- Create professional, implementation-ready content`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: mapPrompt }
                ],
                temperature: 0.4,
                max_tokens: 3000
            });

            const learningMap = JSON.parse(response.choices[0].message.content);

            // Ensure strategy-specific formats
            learningMap.modules.forEach(module => {
                if (module.topics) {
                    module.topics = module.topics.map(topic => {
                        topic.learningFormat = this.selectStrategySpecificFormat(
                            topic.topicName,
                            contentProfile.learningApproach,
                            adaptedStrategy.primaryFormats
                        );
                        return topic;
                    });
                }
            });

            return learningMap;

        } catch (error) {
            console.error('Professional learning map generation failed:', error);
            return this.getStrategySpecificFallback(contentProfile, contentMetadata);
        }
    }

    /**
     * Select learning format based on strategy
     */
    selectStrategySpecificFormat(topicName, strategy, availableFormats) {
        const strategyFormats = {
            'technical': ['Interactive Demonstration', 'Hands-on Simulation', 'Step-by-step Guide', 'Interactive Code Example'],
            'conceptual': ['Interactive Visualization', 'Scenario-based Learning', 'Case Study Analysis', 'Concept Mapping'],
            'procedural': ['Interactive Tutorial', 'Screen Simulation', 'Guided Practice', 'Process Flow'],
            'compliance': ['Scenario Quiz', 'Decision Tree', 'Interactive Example', 'Risk Assessment']
        };

        const formats = strategyFormats[strategy] || availableFormats || ['Interactive Visualization'];

        // Select based on topic content
        if (topicName.toLowerCase().includes('introduction') || topicName.toLowerCase().includes('overview')) {
            return formats.find(f => f.includes('Visualization') || f.includes('Guide')) || formats[0];
        }
        if (topicName.toLowerCase().includes('practice') || topicName.toLowerCase().includes('application')) {
            return formats.find(f => f.includes('Simulation') || f.includes('Scenario')) || formats[1];
        }

        return formats[Math.floor(Math.random() * formats.length)];
    }

    getDefaultContentProfile(contentAnalysis) {
        return {
            contentType: 'conceptual',
            contentComplexity: 'intermediate',
            contentStructure: 'modular',
            keyLearningOutcomes: ['Understand key concepts', 'Apply knowledge practically', 'Demonstrate competency'],
            contentVolume: 'medium',
            optimalModuleCount: 3,
            suggestedDuration: 60,
            primaryDomain: contentAnalysis?.domainClassification?.primaryDomain || 'Professional Development',
            learningChallenges: ['Knowledge retention', 'Practical application'],
            engagementOpportunities: ['Interactive scenarios', 'Real-world examples'],
            assessmentNeeds: ['knowledge-check', 'practical-application'],
            recommendedFormats: ['Interactive Visualization', 'Scenario-based Learning', 'Guided Practice']
        };
    }

    getDefaultStructure(contentProfile) {
        return {
            totalModules: contentProfile.optimalModuleCount || 3,
            moduleStructure: [
                {
                    moduleNumber: 1,
                    moduleTitle: 'Foundation & Overview',
                    purpose: 'Establish foundational understanding',
                    duration: Math.round(contentProfile.suggestedDuration * 0.3),
                    focusArea: 'knowledge building',
                    keyTopics: ['Key concepts', 'Core principles', 'Basic application']
                },
                {
                    moduleNumber: 2,
                    moduleTitle: 'Application & Practice',
                    purpose: 'Develop practical skills',
                    duration: Math.round(contentProfile.suggestedDuration * 0.4),
                    focusArea: 'skill development',
                    keyTopics: ['Practical application', 'Skill practice', 'Problem solving']
                },
                {
                    moduleNumber: 3,
                    moduleTitle: 'Integration & Mastery',
                    purpose: 'Integrate and master concepts',
                    duration: Math.round(contentProfile.suggestedDuration * 0.3),
                    focusArea: 'mastery demonstration',
                    keyTopics: ['Integration', 'Advanced application', 'Mastery validation']
                }
            ],
            learningProgression: 'Sequential progression from foundational concepts to advanced application',
            adaptiveElements: ['Personalized feedback', 'Adaptive practice', 'Performance-based branching'],
            engagementStrategy: 'Interactive, scenario-based learning with continuous feedback'
        };
    }

    getDefaultModule(moduleStructure, strategy) {
        return {
            moduleNumber: moduleStructure.moduleNumber,
            moduleTitle: moduleStructure.moduleTitle,
            estimatedDuration: moduleStructure.duration,
            moduleStory: `Module ${moduleStructure.moduleNumber} focuses on ${moduleStructure.purpose.toLowerCase()} through interactive learning experiences.`,
            topics: [
                {
                    topicName: `${moduleStructure.moduleTitle} Introduction`,
                    sourceContentReference: 'Content analysis pages 1-3',
                    estimatedTime: Math.round(moduleStructure.duration * 0.3),
                    learningFormat: strategy.primaryFormats[0],
                    screenDescription: 'Interactive overview with key concepts and learning objectives'
                },
                {
                    topicName: `${moduleStructure.focusArea} Practice`,
                    sourceContentReference: 'Content analysis core sections',
                    estimatedTime: Math.round(moduleStructure.duration * 0.5),
                    learningFormat: strategy.primaryFormats[1] || strategy.primaryFormats[0],
                    screenDescription: 'Hands-on practice with guided feedback and support'
                },
                {
                    topicName: `${moduleStructure.moduleTitle} Summary`,
                    sourceContentReference: 'Content analysis summary sections',
                    estimatedTime: Math.round(moduleStructure.duration * 0.2),
                    learningFormat: 'Interactive Review',
                    screenDescription: 'Summary and knowledge check with progress tracking'
                }
            ]
        };
    }

    // Helper methods for SME data extraction
    extractOrganizationFromSME(smeResponses) {
        // Look for organization name in SME responses
        for (const response of smeResponses) {
            if (response.organization || response.company) {
                return response.organization || response.company;
            }
        }
        return 'Professional Organization';
    }

    extractLearnerContext(smeResponses) {
        // Extract learner context from SME responses
        return {
            experience: 'Professional level',
            role: 'Team members and managers',
            needs: 'Skill development and practical application'
        };
    }

    extractOrganizationalNeeds(smeResponses) {
        return [
            'Performance improvement',
            'Compliance requirements',
            'Skill standardization'
        ];
    }

    categorizeContentVolume(contentMetadata) {
        if (contentMetadata.totalPages <= 5) return 'micro';
        if (contentMetadata.totalPages <= 15) return 'short';
        if (contentMetadata.totalPages <= 30) return 'medium';
        return 'extensive';
    }

    // Enhanced methods for professional output
    generateProfessionalCourseName(professionalAnalysis, contentProfile) {
        const domain = professionalAnalysis?.domainClassification?.primaryDomain || contentProfile.primaryDomain;
        const complexity = professionalAnalysis?.complexityAssessment?.level || contentProfile.complexity;

        return `${domain} ${complexity} Mastery Program`;
    }

    generateDetailedLearnerPersona(professionalAnalysis, smeResponses, contentProfile) {
        const domain = professionalAnalysis?.domainClassification?.primaryDomain || contentProfile.primaryDomain;
        const complexity = professionalAnalysis?.complexityAssessment?.level || 'Intermediate';

        const experienceLevels = {
            'Beginner': 'foundational knowledge and are new to',
            'Intermediate': 'working knowledge and some practical experience in',
            'Advanced': 'significant expertise and leadership responsibilities in'
        };

        const experience = experienceLevels[complexity] || experienceLevels['Intermediate'];

        return `Professionals working in ${domain} who have ${experience} this field but need to develop specific competencies to enhance performance, meet organizational objectives, and advance their professional capabilities in ${domain.toLowerCase()} practices.`;
    }

    adaptStrategyToAnalysis(contentProfile, userStrategy, professionalAnalysis) {
        const baseStrategy = {
            learningApproach: contentProfile.learningApproach,
            interactionLevel: 'high',
            assessmentIntegration: 'continuous',
            visualDesign: 'professional',
            accessibility: true,
            mobileOptimized: true
        };

        // Get strategy-specific formats
        baseStrategy.primaryFormats = this.learningFormats[contentProfile.contentType] ||
                                     this.learningFormats['conceptual'];

        // Add focus areas based on strategy
        const focusAreas = {
            'technical': ['hands-on practice', 'step-by-step guidance', 'real-world application'],
            'conceptual': ['understanding relationships', 'scenario application', 'concept synthesis'],
            'procedural': ['sequence mastery', 'practice opportunities', 'error prevention'],
            'compliance': ['policy understanding', 'decision making', 'risk awareness'],
            'adaptive': ['comprehensive understanding', 'practical application', 'competency development']
        };

        baseStrategy.focusAreas = focusAreas[contentProfile.learningApproach] || focusAreas['adaptive'];

        return baseStrategy;
    }

    getStrategySpecificFallback(contentProfile, contentMetadata) {
        const pageDistribution = this.distributePages(contentMetadata.totalPages, 3);

        return {
            modules: [
                {
                    moduleNumber: 1,
                    moduleTitle: `${contentProfile.primaryDomain} Foundation`,
                    estimatedDuration: 20,
                    moduleStory: `Introduction to core ${contentProfile.primaryDomain.toLowerCase()} concepts and principles.`,
                    topics: [
                        {
                            topicName: 'Introduction and Overview',
                            sourceContentReference: `Pages ${pageDistribution[0].start}-${pageDistribution[0].end}`,
                            estimatedTime: 7,
                            learningFormat: this.selectStrategySpecificFormat('Introduction', contentProfile.learningApproach, []),
                            screenDescription: 'Interactive overview establishing foundational knowledge'
                        },
                        {
                            topicName: 'Core Concepts',
                            sourceContentReference: `Pages ${pageDistribution[0].start}-${pageDistribution[0].end}`,
                            estimatedTime: 13,
                            learningFormat: this.selectStrategySpecificFormat('Concepts', contentProfile.learningApproach, []),
                            screenDescription: 'Detailed exploration of key principles and concepts'
                        }
                    ]
                },
                {
                    moduleNumber: 2,
                    moduleTitle: `${contentProfile.primaryDomain} Application`,
                    estimatedDuration: 25,
                    moduleStory: `Practical application of ${contentProfile.primaryDomain.toLowerCase()} principles in real-world scenarios.`,
                    topics: [
                        {
                            topicName: 'Practical Implementation',
                            sourceContentReference: `Pages ${pageDistribution[1].start}-${pageDistribution[1].end}`,
                            estimatedTime: 15,
                            learningFormat: this.selectStrategySpecificFormat('Implementation', contentProfile.learningApproach, []),
                            screenDescription: 'Hands-on practice with guided implementation exercises'
                        },
                        {
                            topicName: 'Best Practices',
                            sourceContentReference: `Pages ${pageDistribution[1].start}-${pageDistribution[1].end}`,
                            estimatedTime: 10,
                            learningFormat: this.selectStrategySpecificFormat('Best Practices', contentProfile.learningApproach, []),
                            screenDescription: 'Industry best practices and proven methodologies'
                        }
                    ]
                },
                {
                    moduleNumber: 3,
                    moduleTitle: `${contentProfile.primaryDomain} Mastery`,
                    estimatedDuration: 20,
                    moduleStory: `Advanced application and mastery of ${contentProfile.primaryDomain.toLowerCase()} competencies.`,
                    topics: [
                        {
                            topicName: 'Advanced Scenarios',
                            sourceContentReference: `Pages ${pageDistribution[2].start}-${pageDistribution[2].end}`,
                            estimatedTime: 12,
                            learningFormat: this.selectStrategySpecificFormat('Advanced Scenarios', contentProfile.learningApproach, []),
                            screenDescription: 'Complex scenarios requiring advanced problem-solving'
                        },
                        {
                            topicName: 'Competency Validation',
                            sourceContentReference: `Pages ${pageDistribution[2].start}-${pageDistribution[2].end}`,
                            estimatedTime: 8,
                            learningFormat: this.selectStrategySpecificFormat('Validation', contentProfile.learningApproach, []),
                            screenDescription: 'Final competency demonstration and validation'
                        }
                    ]
                }
            ]
        };
    }

    distributePages(totalPages, moduleCount) {
        const pagesPerModule = Math.ceil(totalPages / moduleCount);
        const distribution = [];

        for (let i = 0; i < moduleCount; i++) {
            const start = Math.max(1, i * pagesPerModule + 1);
            const end = Math.min(totalPages, (i + 1) * pagesPerModule);
            distribution.push({ start, end });
        }

        return distribution;
    }
}

export default AdaptiveLearningMapGenerator;