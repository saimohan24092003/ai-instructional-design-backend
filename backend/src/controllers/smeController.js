// ===================================
// FIXED SME CONTROLLER (controllers/smeController.js)
// ===================================

// Use the existing database Maps from server.js instead of separate modules
// This integrates with your current server structure

class SMEController {
    // Generate content-aware SME questions
    async generateQuestions(req, res) {
        try {
            console.log('🤖 Dr. Elena generating content-aware SME questions...');
            
            const { sessionId, analysisData } = req.body;

            if (!sessionId || !analysisData) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID and analysis data required for SME question generation'
                });
            }

            // Access the database Maps directly from the server
            // These are defined in your main server.js file
            const storedAnalysis = analysisDatabase.get(sessionId) || analysisData;
            const contentData = contentDatabase.get(sessionId);

            if (!storedAnalysis) {
                return res.status(404).json({
                    success: false,
                    message: 'No analysis data found for SME question generation'
                });
            }

            // Generate SME questions using the integrated service
            const smeResult = await this.generateContentAwareQuestions(
                sessionId, 
                storedAnalysis, 
                contentData
            );

            console.log(`✅ Generated ${smeResult.questions.length} content-specific SME questions`);
            console.log(`   📊 Domain: ${smeResult.domain}`);
            console.log(`   🎯 Content Focus: Interactive E-Learning Development`);

            res.json({
                success: true,
                message: `Dr. Elena generated ${smeResult.questions.length} content-specific SME interview questions`,
                data: smeResult,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ SME question generation error:', error);
            res.status(500).json({
                success: false,
                message: 'SME question generation failed',
                error: error.message
            });
        }
    }

    // Generate content-aware SME questions (integrated method)
    async generateContentAwareQuestions(sessionId, analysisData, contentData) {
        console.log('🧠 Dr. Elena generating content-aware SME questions...');
        
        const domain = analysisData.domainClassification?.primaryDomain || 'General';
        const domainKey = analysisData.domainClassification?.domainKey || 'GENERAL';
        const gaps = analysisData.gapAnalysis?.identifiedGaps || [];
        const quality = analysisData.qualityAssessment?.overallScore || 70;
        const suitability = analysisData.suitabilityAssessment?.score || 70;
        const contentLength = contentData?.originalContent ? contentData.originalContent.join('').length : 1000;

        // Determine question count based on content complexity
        const questionCount = this.determineQuestionCount(domain, gaps.length, quality, contentLength);
        
        console.log(`🎯 Generating ${questionCount} questions for ${domain} domain`);

        // Generate questions
        const questions = this.generateSMEQuestions(analysisData, contentData, questionCount);

        // Add metadata to questions
        const enhancedQuestions = questions.map((question, index) => ({
            ...question,
            id: index + 1,
            domain: domain,
            expertAnalyst: AI_INSTRUCTIONAL_DESIGNER.name,
            generatedAt: new Date().toISOString(),
            basedOnContent: true,
            elearningFocused: true
        }));

        // Create SME session data
        const smeSessionId = require('uuid').v4();
        const smeSessionData = {
            smeSessionId: smeSessionId,
            originalSessionId: sessionId,
            questions: enhancedQuestions,
            questionCount: enhancedQuestions.length,
            contentDomain: domain,
            estimatedInterviewTime: `${questionCount * 3}-${questionCount * 5} minutes`,
            expertAnalyst: AI_INSTRUCTIONAL_DESIGNER.name,
            createdAt: new Date().toISOString()
        };

        // Store SME session in existing database Maps
        if (!global.smeSessionDatabase) {
            global.smeSessionDatabase = new Map();
        }
        global.smeSessionDatabase.set(smeSessionId, smeSessionData);

        return smeSessionData;
    }

    // Generate SME questions based on content analysis
    generateSMEQuestions(analysisData, contentData, questionCount) {
        const domain = analysisData.domainClassification?.primaryDomain || 'General';
        const domainKey = analysisData.domainClassification?.domainKey || 'GENERAL';
        const gaps = analysisData.gapAnalysis?.identifiedGaps || [];
        
        const questions = [];

        // Base questions for all domains
        const baseQuestions = [
            {
                question: `Based on your experience with ${domain} training, what are the top 3 challenges learners face when applying this knowledge in real-world scenarios?`,
                type: 'challenges_identification',
                purpose: 'Identify practical application difficulties',
                contentFocus: 'Real-world application'
            },
            {
                question: `What specific examples or scenarios from your field would help learners understand the key concepts in this content?`,
                type: 'scenario_development',
                purpose: 'Develop practical examples',
                contentFocus: 'Contextual examples'
            },
            {
                question: `What are the most common mistakes people make when learning or applying these ${domain} concepts?`,
                type: 'mistake_prevention',
                purpose: 'Identify and prevent common errors',
                contentFocus: 'Error prevention'
            },
            {
                question: `How would you assess whether learners have truly mastered these skills and can apply them independently?`,
                type: 'assessment_strategy',
                purpose: 'Design effective assessments',
                contentFocus: 'Competency evaluation'
            }
        ];

        // Add base questions
        questions.push(...baseQuestions.slice(0, Math.min(4, questionCount)));

        // Add domain-specific questions
        if (questionCount > 4) {
            const domainSpecificQuestions = this.getDomainSpecificQuestions(domainKey, analysisData);
            questions.push(...domainSpecificQuestions.slice(0, questionCount - 4));
        }

        // Add gap-specific questions if needed
        if (gaps.length > 0 && questionCount > questions.length) {
            const gapQuestions = this.generateGapBasedQuestions(gaps, domain);
            questions.push(...gapQuestions.slice(0, questionCount - questions.length));
        }

        // Fill remaining with generic questions if needed
        while (questions.length < questionCount) {
            questions.push({
                question: `What additional insights would help learners better understand and apply this ${domain} content in practice?`,
                type: 'content_enhancement',
                purpose: 'Content improvement',
                contentFocus: 'Practical application'
            });
        }

        return questions.slice(0, questionCount);
    }

    // Get domain-specific questions
    getDomainSpecificQuestions(domainKey, analysisData) {
        const questions = [];

        switch (domainKey) {
            case 'HEALTHCARE':
                questions.push(
                    {
                        question: "What patient safety considerations should be emphasized throughout the training program?",
                        type: 'safety_protocols',
                        purpose: 'Ensure patient safety focus',
                        contentFocus: 'Healthcare safety'
                    },
                    {
                        question: "Can you provide 2-3 realistic patient scenarios that would allow learners to practice these skills safely?",
                        type: 'clinical_scenarios',
                        purpose: 'Develop clinical practice scenarios',
                        contentFocus: 'Clinical simulation'
                    }
                );
                break;

            case 'TECHNOLOGY':
                questions.push(
                    {
                        question: "What hands-on coding exercises or projects would best demonstrate mastery of these technical concepts?",
                        type: 'practical_exercises',
                        purpose: 'Design hands-on practice',
                        contentFocus: 'Technical implementation'
                    },
                    {
                        question: "What are the most common integration challenges developers face with this technology?",
                        type: 'integration_challenges',
                        purpose: 'Address technical difficulties',
                        contentFocus: 'System integration'
                    }
                );
                break;

            case 'BUSINESS':
                questions.push(
                    {
                        question: "What real business scenarios would help learners understand the ROI impact of these concepts?",
                        type: 'business_impact',
                        purpose: 'Connect learning to business outcomes',
                        contentFocus: 'Business value'
                    },
                    {
                        question: "What metrics would you use to measure success when learners apply these skills?",
                        type: 'success_measurement',
                        purpose: 'Define success criteria',
                        contentFocus: 'Performance measurement'
                    }
                );
                break;

            default:
                questions.push(
                    {
                        question: "What industry-specific challenges should be reflected in the interactive exercises?",
                        type: 'industry_challenges',
                        purpose: 'Address sector-specific issues',
                        contentFocus: 'Industry relevance'
                    }
                );
        }

        return questions;
    }

    // Generate gap-based questions
    generateGapBasedQuestions(gaps, domain) {
        const questions = [];

        gaps.forEach((gap, index) => {
            if (questions.length < 2) { // Limit gap-based questions
                questions.push({
                    question: `The analysis identified "${gap.type}" as a gap. What specific elements would you add to address this effectively?`,
                    type: 'gap_resolution',
                    purpose: `Address identified gap: ${gap.type}`,
                    contentFocus: gap.category || 'Content enhancement',
                    relatedGap: gap.type
                });
            }
        });

        return questions;
    }

    // Determine question count based on content complexity
    determineQuestionCount(domain, gapCount, quality, contentLength) {
        let baseCount = 5;
        
        // Adjust based on content complexity
        if (gapCount > 5) baseCount += 1;
        if (quality < 60) baseCount += 1;
        if (contentLength > 5000) baseCount += 1;
        
        // Domain-specific adjustments
        const complexDomains = ['HEALTHCARE', 'TECHNOLOGY', 'COMPLIANCE'];
        if (complexDomains.includes(domain)) baseCount += 1;
        
        return Math.min(8, Math.max(5, baseCount));
    }

    // Submit SME interview answers
    async submitAnswers(req, res) {
        try {
            console.log('💾 Processing SME interview answer submission...');
            
            const { smeSessionId, answers, metadata } = req.body;

            if (!smeSessionId || !answers) {
                return res.status(400).json({
                    success: false,
                    message: 'SME session ID and answers required'
                });
            }

            // Process answers
            const processedAnswers = {
                sessionId: smeSessionId,
                submittedAt: new Date().toISOString(),
                answers: answers.map((answer, index) => ({
                    questionId: answer.questionId || index + 1,
                    question: answer.question,
                    answer: answer.answer,
                    questionType: answer.type || 'general',
                    answerLength: answer.answer ? answer.answer.length : 0
                })),
                metadata: {
                    ...metadata,
                    totalQuestions: answers.length,
                    answeredQuestions: answers.filter(a => a.answer && a.answer.trim().length > 0).length,
                    expertAnalyst: AI_INSTRUCTIONAL_DESIGNER.name
                },
                readyForLearningMap: true
            };

            // Store answers in global database
            if (!global.smeAnswersDatabase) {
                global.smeAnswersDatabase = new Map();
            }
            global.smeAnswersDatabase.set(smeSessionId, processedAnswers);

            console.log(`✅ SME answers processed successfully`);
            console.log(`   📊 Questions: ${processedAnswers.metadata.totalQuestions}`);
            console.log(`   ✍️ Answered: ${processedAnswers.metadata.answeredQuestions}`);

            res.json({
                success: true,
                message: 'SME answers stored successfully for learning map creation',
                data: {
                    sessionId: smeSessionId,
                    answersStored: processedAnswers.metadata.answeredQuestions,
                    totalQuestions: processedAnswers.metadata.totalQuestions,
                    readyForLearningMap: true,
                    completedAt: processedAnswers.submittedAt
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ SME answer submission error:', error);
            res.status(500).json({
                success: false,
                message: 'SME answer storage failed',
                error: error.message
            });
        }
    }

    // Get SME session data
    async getSession(req, res) {
        try {
            const { sessionId } = req.params;
            
            const sessionData = global.smeSessionDatabase?.get(sessionId);
            const answers = global.smeAnswersDatabase?.get(sessionId);
            
            if (!sessionData) {
                return res.status(404).json({
                    success: false,
                    message: 'SME session not found'
                });
            }

            res.json({
                success: true,
                data: {
                    session: sessionData,
                    answers: answers,
                    status: answers ? 'completed' : 'pending',
                    readyForLearningMap: sessionData.readyForLearningMap || false
                }
            });

        } catch (error) {
            console.error('❌ SME session retrieval error:', error);
            res.status(500).json({
                success: false,
                message: 'SME session retrieval failed',
                error: error.message
            });
        }
    }

    // List all SME sessions
    async listSessions(req, res) {
        try {
            const sessions = global.smeSessionDatabase ? Array.from(global.smeSessionDatabase.values()) : [];
            
            res.json({
                success: true,
                data: {
                    sessions: sessions,
                    total: sessions.length
                }
            });

        } catch (error) {
            console.error('❌ SME sessions listing error:', error);
            res.status(500).json({
                success: false,
                message: 'SME sessions listing failed',
                error: error.message
            });
        }
    }
}

module.exports = new SMEController();