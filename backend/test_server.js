// Simple test server to verify the enhanced AI strategy analysis
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock OpenAI for testing
const mockOpenAI = {
    chat: {
        completions: {
            create: async (options) => {
                // Simulate AI response with content-specific strategies
                const content = options.messages[1].content;

                let mockResponse = '';
                if (content.includes('cloud') || content.includes('security') || content.includes('Technical')) {
                    mockResponse = JSON.stringify({
                        executiveSummary: "Expert analysis reveals cloud infrastructure security content requiring hands-on simulation practice and competency validation.",
                        recommendedStrategies: [
                            {
                                strategyName: "Simulation and Virtual Labs Strategy",
                                suitabilityScore: 96,
                                whySuitable: "Cloud security content requires hands-on practice with real tools in safe environments. Virtual labs allow unlimited experimentation without production risks.",
                                contentAlignment: "Technical cloud content demands practical experience with actual platforms and security configurations.",
                                expectedOutcomes: "Mastery of cloud security, reduced vulnerabilities, increased operational confidence"
                            },
                            {
                                strategyName: "Assessment-Driven Strategy",
                                suitabilityScore: 89,
                                whySuitable: "Security content requires continuous competency validation to ensure professionals can handle real-world threats.",
                                contentAlignment: "Technical security knowledge must be verified through practical assessments.",
                                expectedOutcomes: "Validated technical competency, improved security posture"
                            },
                            {
                                strategyName: "Microlearning Strategy",
                                suitabilityScore: 87,
                                whySuitable: "Complex technical concepts benefit from focused, bite-sized delivery to prevent cognitive overload.",
                                contentAlignment: "Technical procedures are ideal for step-by-step microlearning modules.",
                                expectedOutcomes: "Better retention, higher completion rates, improved application"
                            }
                        ]
                    });
                } else if (content.includes('leadership') || content.includes('business') || content.includes('Business')) {
                    mockResponse = JSON.stringify({
                        executiveSummary: "Expert analysis reveals leadership development content requiring realistic scenarios and peer collaboration for strategic thinking development.",
                        recommendedStrategies: [
                            {
                                strategyName: "Scenario-Based Learning Strategy",
                                suitabilityScore: 94,
                                whySuitable: "Leadership content requires realistic management scenarios that challenge decision-making skills and strategic thinking abilities.",
                                contentAlignment: "Management content comes alive through authentic workplace scenarios that mirror real leadership challenges.",
                                expectedOutcomes: "Enhanced leadership decision-making, improved strategic thinking, better team management"
                            },
                            {
                                strategyName: "Social Learning Strategy",
                                suitabilityScore: 87,
                                whySuitable: "Leadership development benefits from peer networking, executive mentoring, and informal knowledge exchange among senior professionals.",
                                contentAlignment: "Management content is enriched through executive forums and leadership communities.",
                                expectedOutcomes: "Expanded professional networks, enhanced peer learning, improved leadership insights"
                            },
                            {
                                strategyName: "Collaborative Learning Strategy",
                                suitabilityScore: 85,
                                whySuitable: "Business learning benefits from peer interaction, knowledge sharing, and collective problem-solving approaches.",
                                contentAlignment: "Business concepts are enhanced through discussion, debate, and collaborative analysis.",
                                expectedOutcomes: "Improved team collaboration, diverse perspective integration"
                            }
                        ]
                    });
                } else if (content.includes('clinical') || content.includes('medical') || content.includes('Healthcare')) {
                    mockResponse = JSON.stringify({
                        executiveSummary: "Expert analysis reveals clinical content requiring high-fidelity simulations and rigorous competency assessment for patient safety.",
                        recommendedStrategies: [
                            {
                                strategyName: "Simulation and Virtual Labs Strategy",
                                suitabilityScore: 98,
                                whySuitable: "Clinical content requires high-fidelity patient simulations to practice decision-making without patient risk.",
                                contentAlignment: "Medical content demands realistic clinical scenarios that virtual simulations provide safely.",
                                expectedOutcomes: "Improved clinical reasoning, enhanced patient safety, better diagnostic accuracy"
                            },
                            {
                                strategyName: "Assessment-Driven Strategy",
                                suitabilityScore: 93,
                                whySuitable: "Healthcare content requires rigorous competency assessment to ensure patient safety and regulatory compliance.",
                                contentAlignment: "Clinical knowledge must be continuously validated through comprehensive assessments.",
                                expectedOutcomes: "Validated clinical competency, improved patient safety, regulatory compliance"
                            },
                            {
                                strategyName: "Storytelling Strategy",
                                suitabilityScore: 84,
                                whySuitable: "Medical case narratives help healthcare professionals relate to patient experiences and remember critical procedures.",
                                contentAlignment: "Clinical content benefits from patient story narratives that make procedures memorable.",
                                expectedOutcomes: "Enhanced empathy, improved procedure recall, better patient care"
                            }
                        ]
                    });
                } else {
                    // Generic content gets different strategies
                    mockResponse = JSON.stringify({
                        executiveSummary: "Expert analysis reveals general training content requiring structured delivery and interactive engagement approaches.",
                        recommendedStrategies: [
                            {
                                strategyName: "Content Strategy",
                                suitabilityScore: 88,
                                whySuitable: "General content requires strategic organization and delivery planning to maximize learning effectiveness.",
                                contentAlignment: "Systematic content planning ensures optimal learning outcomes.",
                                expectedOutcomes: "Enhanced content organization, improved learning flow"
                            },
                            {
                                strategyName: "Learner-Centered Strategy",
                                suitabilityScore: 85,
                                whySuitable: "General content benefits from tailoring to learner needs and preferences for increased relevance.",
                                contentAlignment: "Customized content delivery increases learning impact.",
                                expectedOutcomes: "Personalized learning experience, improved engagement"
                            },
                            {
                                strategyName: "Adaptive Learning Strategy",
                                suitabilityScore: 82,
                                whySuitable: "General content can leverage adaptive technology to personalize learning paths based on performance.",
                                contentAlignment: "Adaptive algorithms optimize learning efficiency.",
                                expectedOutcomes: "Personalized learning paths, optimized learning time"
                            }
                        ]
                    });
                }

                return {
                    choices: [{
                        message: {
                            content: mockResponse
                        }
                    }]
                };
            }
        }
    }
};

// Test endpoint
app.post('/api/generate-comprehensive-strategy-analysis', async (req, res) => {
    try {
        const { sessionId } = req.body;
        console.log('🧪 Testing enhanced AI strategy analysis for session:', sessionId);

        // Mock content analysis data for testing
        const mockContentAnalysis = {
            domainClassification: {
                primaryDomain: 'Technology',
                contentType: 'Cloud Infrastructure Security Training',
                complexity: 'Advanced'
            },
            qualityAssessment: {
                overallScore: 85
            },
            originalContent: 'Cloud Infrastructure Security Implementation - This technical guide covers advanced security implementations for enterprise cloud infrastructure using AWS, Azure, and Google Cloud Platform. The document focuses on zero-trust architecture, container security with Kubernetes, network segmentation strategies, and automated threat detection systems.'
        };

        const mockSMEResponses = {
            smeResponses: [
                {
                    question: 'What are your main learning objectives?',
                    answer: 'We need hands-on experience with cloud security configurations and threat detection systems.'
                },
                {
                    question: 'Who is your target audience?',
                    answer: 'Senior cloud engineers and security specialists with 3-5 years experience.'
                }
            ]
        };

        // Use mock AI analysis
        const analysisPrompt = `Testing content-specific strategy analysis for cloud security training...`;

        const completion = await mockOpenAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are Dr. Elena Rodriguez, expert instructional designer." },
                { role: "user", content: analysisPrompt }
            ]
        });

        const analysisResult = completion.choices[0].message.content;
        const parsedAnalysis = JSON.parse(analysisResult);

        console.log('✅ Enhanced AI analysis generated successfully');
        console.log('📊 Strategies:', parsedAnalysis.recommendedStrategies.map(s => s.strategyName));

        res.json({
            success: true,
            sessionId,
            analysis: parsedAnalysis,
            message: 'Enhanced comprehensive strategy analysis generated'
        });

    } catch (error) {
        console.error('❌ Error generating analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate analysis'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Test server running', port: 3002 });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`🧪 Enhanced AI Test Server running on http://localhost:${PORT}`);
    console.log('🎯 Ready to test content-specific strategy recommendations');
});