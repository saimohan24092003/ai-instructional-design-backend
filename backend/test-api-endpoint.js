// Test the strategy recommendation API endpoint
import express from 'express';
import cors from 'cors';
import { env } from './src/config/env.js';
import strategyRouter from './src/routes/strategy.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/strategy', strategyRouter);

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Strategy API test server running!' });
});

const PORT = 3001; // Use different port for testing
const server = app.listen(PORT, () => {
    console.log(`🧪 Test server running on http://localhost:${PORT}`);
    console.log('🔍 Testing strategy recommendation endpoint...\n');

    // Test the strategy endpoint
    testStrategyEndpoint();
});

async function testStrategyEndpoint() {
    const testData = {
        contentAnalysis: {
            extractedTopics: ['project management', 'leadership', 'team collaboration'],
            complexityLevel: 'medium',
            primaryContentType: 'business documentation',
            fileCount: 3
        },
        smeInterview: {
            answers: {
                0: 'We need to improve our project management skills across the organization',
                1: 'Interactive scenarios work best for our managers',
                2: 'We prefer blended learning with both online and in-person components',
                3: 'Assessment and certification are important for tracking progress'
            },
            completionPercentage: 90,
            questions: [
                'What are your main learning objectives?',
                'What learning approach works best?',
                'What delivery method do you prefer?',
                'How important is assessment?'
            ]
        },
        requestId: 'test-' + Date.now(),
        useAI: false // Test framework-only first
    };

    try {
        const fetch = (await import('node-fetch')).default;

        console.log('📡 Making API request to strategy endpoint...');

        const response = await fetch(`http://localhost:${PORT}/api/strategy/generate-recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ API Response received successfully!');
            console.log(`📊 Method: ${result.data.method}`);
            console.log(`🎯 Strategies returned: ${result.data.strategies.length}`);
            console.log(`📈 Total strategies analyzed: ${result.data.totalStrategiesAnalyzed}\n`);

            console.log('🏆 Top Recommendations:');
            result.data.strategies.slice(0, 3).forEach((strategy, index) => {
                console.log(`   ${index + 1}. ${strategy.title}`);
                console.log(`      Score: ${strategy.score || 'N/A'}`);
                console.log(`      Type: ${strategy.icon} ${strategy.color}`);
                console.log(`      Reasoning: ${(strategy.reasoning || '').substring(0, 100)}...`);
            });

            console.log('\n✅ Strategy API endpoint test completed successfully!');
        } else {
            const errorText = await response.text();
            console.error('❌ API request failed:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        server.close();
        console.log('\n🔚 Test server stopped');
    }
}