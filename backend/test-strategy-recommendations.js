// Test script for the enhanced strategy recommendation system
import { recommendStrategies, INSTRUCTIONAL_STRATEGIES } from './src/services/instructionalStrategies.js';

console.log('🧪 Testing Enhanced Strategy Recommendation System\n');

// Sample content analysis data
const sampleContentAnalysis = {
    extractedTopics: ['software training', 'technical skills', 'programming'],
    complexityLevel: 'medium',
    primaryContentType: 'technical documentation',
    fileCount: 5
};

// Sample SME interview data
const sampleSMEInterview = {
    answers: {
        0: 'Our team needs hands-on practice with the new software tools',
        1: 'We prefer interactive learning that we can do at our own pace',
        2: 'Mobile accessibility is important for our field workers',
        3: 'We need practical scenarios that match real-world situations'
    },
    completionPercentage: 85,
    questions: [
        'What are your main learning objectives?',
        'What delivery method works best for your team?',
        'Do you need mobile-friendly learning?',
        'How important are real-world applications?'
    ]
};

console.log('📊 Input Data:');
console.log('Content Topics:', sampleContentAnalysis.extractedTopics);
console.log('Complexity:', sampleContentAnalysis.complexityLevel);
console.log('SME Completion:', sampleSMEInterview.completionPercentage + '%');
console.log('\n🔍 Generating recommendations...\n');

// Generate recommendations
const recommendations = recommendStrategies(sampleContentAnalysis, sampleSMEInterview, {
    maxRecommendations: 5
});

console.log('✨ STRATEGY RECOMMENDATIONS:');
console.log('============================\n');

recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.title}`);
    console.log(`   Score: ${rec.score.toFixed(1)}/100`);
    console.log(`   Description: ${rec.description.substring(0, 100)}...`);
    console.log(`   Use Cases: ${rec.useCases.slice(0, 2).join(', ')}`);
    console.log(`   Icon: ${rec.icon} | Color: ${rec.color}`);
    console.log(`   Reasoning: ${rec.reasoning.substring(0, 120)}...`);
    console.log('   ---');
});

console.log(`\n📈 Analysis Summary:`);
console.log(`   Total available strategies: ${Object.keys(INSTRUCTIONAL_STRATEGIES).length}`);
console.log(`   Recommended strategies: ${recommendations.length}`);
console.log(`   Average recommendation score: ${(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length).toFixed(1)}/100`);

console.log('\n🎯 Top 3 Recommendations:');
recommendations.slice(0, 3).forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec.title} (${rec.score.toFixed(1)}/100)`);
});

console.log('\n✅ Strategy recommendation system test completed successfully!');