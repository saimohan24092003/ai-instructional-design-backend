import express from 'express';
import { OpenAI } from 'openai';
import { env } from '../config/env.js';
import { recommendStrategies, INSTRUCTIONAL_STRATEGIES } from '../services/instructionalStrategies.js';
import { calculateContentScores } from '../services/contentScoring.js';

const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: env.openaiApiKey // Make sure to add your OpenAI API key to env.js
});

// Generate evidence-based strategy recommendations using instructional design framework
router.post('/generate-recommendations', async (req, res) => {
  try {
    console.log('Generating evidence-based strategy recommendations...');

    const { contentAnalysis, smeInterview, uploadedFiles, requestId, useAI = false } = req.body;

    // Validate input data
    if (!contentAnalysis || !smeInterview) {
      return res.status(400).json({
        success: false,
        message: 'Content analysis and SME interview data required'
      });
    }

    // Calculate enhanced content scores
    const contentScores = calculateContentScores(contentAnalysis, smeInterview);
    console.log('📊 Content Scores Calculated:', contentScores);

    // Generate strategies using evidence-based framework
    const frameworkStrategies = recommendStrategies(contentAnalysis, smeInterview, {
      maxRecommendations: 5
    });

    let strategies = frameworkStrategies;

    // Optionally enhance with AI for additional insights
    if (useAI && env.openaiApiKey) {
      try {
        const aiStrategies = await generateAIEnhancedStrategies(
          contentAnalysis,
          smeInterview,
          frameworkStrategies,
          uploadedFiles
        );

        // Merge framework and AI strategies, prioritizing framework
        strategies = mergeStrategies(frameworkStrategies, aiStrategies);

        console.log('Enhanced recommendations with AI insights');
      } catch (aiError) {
        console.warn('AI enhancement failed, using framework strategies only:', aiError.message);
      }
    }

    // Store the generated strategies with enhanced content scores
    const strategyData = {
      requestId,
      strategies,
      contentScores, // Include the enhanced scoring
      generatedAt: new Date().toISOString(),
      contentAnalysis,
      smeInterview,
      method: useAI ? 'framework-with-ai-enhancement' : 'evidence-based-framework',
      totalStrategiesAnalyzed: Object.keys(INSTRUCTIONAL_STRATEGIES).length
    };

    res.json({
      success: true,
      message: 'Strategy recommendations generated successfully',
      data: strategyData
    });

    console.log(`Generated ${strategies.length} evidence-based strategies for request ${requestId}`);

  } catch (error) {
    console.error('Error generating strategy recommendations:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to generate strategy recommendations',
      error: error.message
    });
  }
});

// Generate AI-enhanced strategies as supplement to framework recommendations
async function generateAIEnhancedStrategies(contentAnalysis, smeInterview, frameworkStrategies, uploadedFiles) {
  const prompt = createEnhancementPrompt(contentAnalysis, smeInterview, frameworkStrategies, uploadedFiles);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert instructional designer. The user has already received evidence-based strategy recommendations. Provide additional creative insights, implementation tips, and innovative variations that complement the existing recommendations. Focus on practical enhancements and creative applications."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1500
  });

  const aiResponse = completion.choices[0].message.content;
  return parseAIEnhancements(aiResponse, frameworkStrategies);
}

// Create prompt for AI enhancement
function createEnhancementPrompt(contentAnalysis, smeInterview, frameworkStrategies, uploadedFiles) {
  const topics = contentAnalysis.extractedTopics || ['educational content'];
  const strategyNames = frameworkStrategies.map(s => s.title).join(', ');

  return `
EXISTING EVIDENCE-BASED RECOMMENDATIONS:
${strategyNames}

CONTENT CONTEXT:
- Topics: ${topics.join(', ')}
- Complexity: ${contentAnalysis.complexityLevel || 'medium'}
- Content Type: ${contentAnalysis.primaryContentType || 'document'}

SME PREFERENCES SUMMARY:
${Object.entries(smeInterview.answers || {}).map(([index, answer], i) =>
  `Response ${parseInt(index) + 1}: ${typeof answer === 'string' ? answer.substring(0, 150) : 'No response'}...`
).slice(0, 3).join('\n')}

TASK:
Provide 2-3 creative enhancements or innovative variations that could complement the existing recommendations. Focus on:
1. Creative implementation ideas for the recommended strategies
2. Technology-enhanced variations
3. Innovative engagement techniques

Format as a brief JSON array with title, description, and enhancement_type fields.
`;
}

// Parse AI enhancements and integrate with framework strategies
function parseAIEnhancements(aiResponse, frameworkStrategies) {
  try {
    if (aiResponse.includes('[') && aiResponse.includes(']')) {
      const jsonStart = aiResponse.indexOf('[');
      const jsonEnd = aiResponse.lastIndexOf(']') + 1;
      const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
      const enhancements = JSON.parse(jsonStr);

      return enhancements.map((enhancement, index) => ({
        id: frameworkStrategies.length + index + 1,
        title: enhancement.title || `AI Enhancement ${index + 1}`,
        description: enhancement.description || 'AI-generated enhancement strategy',
        icon: 'psychology',
        color: 'purple',
        score: 75, // Lower than framework strategies
        reasoning: `AI-generated enhancement: ${enhancement.enhancement_type || 'Creative variation'}`,
        aiEnhanced: true,
        enhancementType: enhancement.enhancement_type || 'creative'
      }));
    }
  } catch (error) {
    console.warn('Failed to parse AI enhancements:', error);
  }

  return [];
}

// Merge framework and AI strategies, prioritizing framework
function mergeStrategies(frameworkStrategies, aiStrategies) {
  // Framework strategies always come first (they have higher scores)
  const merged = [...frameworkStrategies];

  // Add up to 2 AI enhancements if they add value
  const topAIStrategies = aiStrategies.slice(0, 2);
  merged.push(...topAIStrategies);

  return merged.slice(0, 6); // Limit total to 6 strategies
}

// Add route to get all available strategies (for reference)
router.get('/available-strategies', (req, res) => {
  const strategies = Object.entries(INSTRUCTIONAL_STRATEGIES).map(([key, strategy]) => ({
    id: key,
    name: strategy.name,
    description: strategy.description,
    useCases: strategy.useCases.slice(0, 3), // First 3 use cases
    idealFor: strategy.idealFor,
    icon: strategy.icon,
    color: strategy.color
  }));

  res.json({
    success: true,
    message: 'Available instructional design strategies',
    data: {
      totalStrategies: strategies.length,
      strategies
    }
  });
});

// Create comprehensive prompt for ChatGPT (legacy function, kept for backward compatibility)
function createStrategyPrompt(contentAnalysis, smeInterview, uploadedFiles) {
  const topics = contentAnalysis.extractedTopics || ['educational content'];
  const fileCount = uploadedFiles?.length || 0;
  const complexity = contentAnalysis.complexityLevel || 'intermediate';
  const primaryType = contentAnalysis.primaryContentType || 'document';

  // Analyze SME answers for key themes
  const smeAnswerText = Object.values(smeInterview.answers || {}).join(' ').toLowerCase();
  const emphasizesInteraction = smeAnswerText.includes('interactive') || smeAnswerText.includes('engage');
  const focusesOnPractical = smeAnswerText.includes('practical') || smeAnswerText.includes('hands-on');
  const mentionsAssessment = smeAnswerText.includes('assess') || smeAnswerText.includes('test');
  const highlightsScenarios = smeAnswerText.includes('scenario') || smeAnswerText.includes('real-world');

  const prompt = `
CONTENT ANALYSIS:
- Topics: ${topics.join(', ')}
- File Count: ${fileCount} files
- Content Type: ${primaryType}
- Complexity: ${complexity}

SME INTERVIEW INSIGHTS:
- Total Questions: ${smeInterview.questions?.length || 0}
- Completion: ${smeInterview.completionPercentage || 0}%
- Key Themes Identified:
  ${emphasizesInteraction ? '• Emphasis on learner interaction and engagement' : ''}
  ${focusesOnPractical ? '• Focus on practical, hands-on application' : ''}
  ${mentionsAssessment ? '• Strong emphasis on assessment and validation' : ''}
  ${highlightsScenarios ? '• Preference for scenario-based and real-world learning' : ''}

SME RESPONSES SUMMARY:
${Object.entries(smeInterview.answers || {}).map(([index, answer], i) => 
  `Question ${parseInt(index) + 1}: ${typeof answer === 'string' ? answer.substring(0, 200) : 'No response'}...`
).join('\n')}

TASK:
Generate 4-6 personalized learning strategy recommendations that:
1. Address the specific topics: ${topics.join(', ')}
2. Match the ${complexity} complexity level
3. Incorporate the SME's preferences and insights
4. Are practical and implementable
5. Include innovative e-learning approaches

For each strategy, provide:
- Title: Creative, specific title related to the content
- Description: 2-3 sentence description of implementation
- Rationale: Why this strategy fits the content and SME responses
- Impact: Expected learning impact (High/Medium/Low)
- Complexity: Implementation complexity (High/Medium/Low)
- Icon: Material Design icon name that fits the strategy

Format your response as a JSON array of strategy objects.
`;

  return prompt;
}

// Parse AI response and structure it
function parseAIResponse(aiResponse, contentAnalysis, smeInterview) {
  try {
    // Try to parse JSON response first
    if (aiResponse.includes('[') && aiResponse.includes(']')) {
      const jsonStart = aiResponse.indexOf('[');
      const jsonEnd = aiResponse.lastIndexOf(']') + 1;
      const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
      const parsedStrategies = JSON.parse(jsonStr);

      return parsedStrategies.map((strategy, index) => ({
        id: index + 1,
        title: strategy.title || `Strategy ${index + 1}`,
        description: strategy.description || 'AI-generated learning strategy',
        icon: strategy.icon || 'lightbulb',
        color: getStrategyColor(index),
        rationale: strategy.rationale || 'Based on content and SME analysis',
        implementationComplexity: strategy.complexity || 'Medium',
        estimatedImpact: strategy.impact || 'Medium',
        aiGenerated: true
      }));
    }
  } catch (parseError) {
    console.warn('Failed to parse AI JSON response, using text parsing:', parseError);
  }

  // Fallback: Parse text response
  return parseTextResponse(aiResponse, contentAnalysis, smeInterview);
}

// Parse text response when JSON parsing fails
function parseTextResponse(aiResponse, contentAnalysis, smeInterview) {
  const topics = contentAnalysis.extractedTopics || ['content'];
  const strategies = [];

  // Split response into sections and extract strategies
  const sections = aiResponse.split('\n\n');
  let strategyCount = 0;

  for (let section of sections) {
    if (section.includes('Title:') || section.includes('Strategy')) {
      const title = extractValue(section, 'Title:') || `${topics[0]} Learning Strategy ${strategyCount + 1}`;
      const description = extractValue(section, 'Description:') || 'AI-generated personalized learning strategy.';
      const rationale = extractValue(section, 'Rationale:') || 'Based on content analysis and SME responses.';
      const impact = extractValue(section, 'Impact:') || 'Medium';
      const complexity = extractValue(section, 'Complexity:') || 'Medium';

      strategies.push({
        id: strategyCount + 1,
        title: title,
        description: description,
        icon: getStrategyIcon(title, strategyCount),
        color: getStrategyColor(strategyCount),
        rationale: rationale,
        implementationComplexity: complexity,
        estimatedImpact: impact,
        aiGenerated: true
      });

      strategyCount++;
      if (strategyCount >= 6) break; // Limit to 6 strategies
    }
  }

  // If no strategies found, create default ones
  if (strategies.length === 0) {
    strategies.push(
      {
        id: 1,
        title: `Interactive ${topics[0]} Learning`,
        description: `Create interactive learning experiences that engage learners with your ${topics.join(' and ')} content through multimedia and hands-on activities.`,
        icon: 'quiz',
        color: 'red',
        rationale: 'AI-generated based on your content topics and learning preferences.',
        implementationComplexity: 'Medium',
        estimatedImpact: 'High',
        aiGenerated: true
      },
      {
        id: 2,
        title: 'Scenario-Based Application',
        description: `Develop real-world scenarios that allow learners to apply ${topics.join(' and ')} concepts in practical, decision-making contexts.`,
        icon: 'account_tree',
        color: 'blue',
        rationale: 'Recommended for practical application of your content.',
        implementationComplexity: 'Medium',
        estimatedImpact: 'High',
        aiGenerated: true
      }
    );
  }

  return strategies;
}

// Helper function to extract values from text
function extractValue(text, label) {
  const lines = text.split('\n');
  for (let line of lines) {
    if (line.includes(label)) {
      return line.replace(label, '').trim();
    }
  }
  return null;
}

// Get strategy icon based on title
function getStrategyIcon(title, index) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('quiz') || titleLower.includes('assess')) return 'quiz';
  if (titleLower.includes('scenario') || titleLower.includes('branch')) return 'account_tree';
  if (titleLower.includes('video') || titleLower.includes('multimedia')) return 'videocam';
  if (titleLower.includes('collaborative') || titleLower.includes('group')) return 'edit_note';
  if (titleLower.includes('support') || titleLower.includes('help')) return 'support_agent';
  if (titleLower.includes('game') || titleLower.includes('interactive')) return 'sports_esports';

  const icons = ['lightbulb', 'psychology', 'school', 'trending_up', 'groups', 'analytics'];
  return icons[index % icons.length];
}

// Get strategy color
function getStrategyColor(index) {
  const colors = ['red', 'blue', 'green'];
  return colors[index % colors.length];
}

export default router;
