// Content Scoring Service for Professional Analysis
// Provides accurate Content Suitability, Engagement Potential, and Learning Effectiveness scores

export function calculateContentScores(contentAnalysis, smeInterview) {
    const contentSuitability = calculateContentSuitability(contentAnalysis);
    const engagementPotential = calculateEngagementPotential(contentAnalysis, smeInterview);
    const learningEffectiveness = calculateLearningEffectiveness(contentAnalysis, smeInterview);

    return {
        contentSuitability: Math.round(contentSuitability),
        engagementPotential: Math.round(engagementPotential),
        learningEffectiveness: Math.round(learningEffectiveness),
        overallScore: Math.round((contentSuitability + engagementPotential + learningEffectiveness) / 3),
        recommendations: generateScoringRecommendations(contentSuitability, engagementPotential, learningEffectiveness)
    };
}

function calculateContentSuitability(contentAnalysis) {
    let score = 0;
    const maxScore = 100;

    // Content Quality Assessment (40 points)
    const clarity = contentAnalysis.qualityAssessment?.clarity || contentAnalysis.qualityScore || 75;
    const completeness = contentAnalysis.qualityAssessment?.completeness || 75;
    const structure = contentAnalysis.qualityAssessment?.structure || 75;
    const currency = contentAnalysis.qualityAssessment?.currency || 75;

    score += (clarity + completeness + structure + currency) / 4 * 0.4;

    // Content Type Suitability (25 points)
    const contentType = (contentAnalysis.primaryContentType || '').toLowerCase();
    const suitabilityByType = {
        'technical documentation': 90,
        'business training': 95,
        'compliance training': 88,
        'process documentation': 85,
        'software training': 92,
        'healthcare training': 87,
        'safety protocols': 90,
        'product training': 88,
        'leadership development': 85,
        'sales training': 90
    };

    const typeSuitability = suitabilityByType[contentType] || 75;
    score += typeSuitability * 0.25;

    // Complexity Match (20 points)
    const complexity = contentAnalysis.complexityLevel || 'medium';
    const complexityScores = {
        'low': 85,      // Easy to convert to e-learning
        'medium': 90,   // Ideal for e-learning
        'high': 80      // Requires more sophisticated approach
    };
    score += complexityScores[complexity] * 0.2;

    // Content Volume and Scope (15 points)
    const topics = contentAnalysis.extractedTopics || [];
    const topicCount = topics.length;

    if (topicCount >= 3 && topicCount <= 8) {
        score += 15; // Ideal topic count
    } else if (topicCount >= 2 && topicCount <= 10) {
        score += 12; // Good topic count
    } else if (topicCount >= 1) {
        score += 8;  // Minimum viable content
    }

    return Math.min(score, maxScore);
}

function calculateEngagementPotential(contentAnalysis, smeInterview) {
    let score = 0;
    const maxScore = 100;

    // Content Domain Engagement Factor (30 points)
    const domain = (contentAnalysis.contentDomain || contentAnalysis.domainClassification?.contentType || '').toLowerCase();
    const engagementByDomain = {
        'technical training': 85,        // High - hands-on nature
        'business training': 80,         // Good - case studies and scenarios
        'compliance training': 70,       // Moderate - can be dry but necessary
        'healthcare training': 90,       // High - life-critical, engaging scenarios
        'software training': 88,         // High - interactive potential
        'sales training': 92,           // Very high - role-play potential
        'leadership development': 85,    // High - case studies and reflection
        'safety training': 82,          // Good - scenario-based potential
        'product training': 78,         // Moderate to good
        'customer service': 88          // High - role-play potential
    };

    const domainEngagement = engagementByDomain[domain] || 75;
    score += domainEngagement * 0.3;

    // Interactive Elements Potential (25 points)
    const topics = contentAnalysis.extractedTopics || [];
    const topicsText = topics.join(' ').toLowerCase();

    let interactivityScore = 60; // Base score

    // Boost for content that lends itself to interaction
    if (topicsText.includes('process') || topicsText.includes('procedure')) interactivityScore += 10;
    if (topicsText.includes('software') || topicsText.includes('application')) interactivityScore += 15;
    if (topicsText.includes('decision') || topicsText.includes('problem solving')) interactivityScore += 12;
    if (topicsText.includes('scenario') || topicsText.includes('case study')) interactivityScore += 10;
    if (topicsText.includes('hands-on') || topicsText.includes('practical')) interactivityScore += 8;

    score += Math.min(interactivityScore, 100) * 0.25;

    // SME Preferences Alignment (20 points)
    let smeEngagementScore = 70; // Base score

    if (smeInterview && smeInterview.answers) {
        const answersText = Object.values(smeInterview.answers).join(' ').toLowerCase();

        // Positive engagement indicators
        if (answersText.includes('interactive') || answersText.includes('engaging')) smeEngagementScore += 15;
        if (answersText.includes('hands-on') || answersText.includes('practical')) smeEngagementScore += 12;
        if (answersText.includes('scenario') || answersText.includes('real-world')) smeEngagementScore += 10;
        if (answersText.includes('visual') || answersText.includes('multimedia')) smeEngagementScore += 8;
        if (answersText.includes('gamifi') || answersText.includes('competition')) smeEngagementScore += 10;
        if (answersText.includes('social') || answersText.includes('collaboration')) smeEngagementScore += 8;

        // Completion rate bonus
        const completionRate = smeInterview.completionPercentage || 0;
        smeEngagementScore += (completionRate / 100) * 10;
    }

    score += Math.min(smeEngagementScore, 100) * 0.2;

    // Content Complexity Engagement Factor (15 points)
    const complexity = contentAnalysis.complexityLevel || 'medium';
    const complexityEngagement = {
        'low': 75,      // May be less engaging due to simplicity
        'medium': 85,   // Sweet spot for engagement
        'high': 80      // Can be engaging but may overwhelm some learners
    };
    score += complexityEngagement[complexity] * 0.15;

    // Learning Format Variety Potential (10 points)
    let formatVarietyScore = 60;
    const fileCount = contentAnalysis.fileCount || 1;

    if (fileCount > 5) formatVarietyScore += 20; // Rich content variety
    else if (fileCount > 2) formatVarietyScore += 15; // Good variety
    else if (fileCount > 1) formatVarietyScore += 10; // Some variety

    score += Math.min(formatVarietyScore, 100) * 0.1;

    return Math.min(score, maxScore);
}

function calculateLearningEffectiveness(contentAnalysis, smeInterview) {
    let score = 0;
    const maxScore = 100;

    // Learning Objectives Clarity (25 points)
    let objectivesScore = 70; // Base score

    const topics = contentAnalysis.extractedTopics || [];
    if (topics.length >= 3 && topics.length <= 8) {
        objectivesScore += 15; // Clear, focused objectives possible
    } else if (topics.length >= 2) {
        objectivesScore += 10; // Reasonable objectives possible
    }

    // Boost for content types that have clear learning outcomes
    const contentType = (contentAnalysis.primaryContentType || '').toLowerCase();
    if (contentType.includes('training') || contentType.includes('procedure')) {
        objectivesScore += 10;
    }

    score += Math.min(objectivesScore, 100) * 0.25;

    // Content Structure and Progression (20 points)
    const complexity = contentAnalysis.complexityLevel || 'medium';
    let structureScore = 75; // Base score

    // Well-structured complexity levels support better learning
    if (complexity === 'medium') structureScore += 15; // Ideal for progressive learning
    else if (complexity === 'low') structureScore += 10; // Good foundation building
    else if (complexity === 'high') structureScore += 5; // Advanced but may need scaffolding

    // Content organization bonus
    const qualityScore = contentAnalysis.qualityAssessment?.overallScore ||
                        contentAnalysis.qualityScore || 75;
    structureScore += (qualityScore - 70) * 0.3; // Bonus for high quality

    score += Math.min(structureScore, 100) * 0.2;

    // Practical Application Potential (20 points)
    let applicationScore = 65; // Base score

    const topicsText = topics.join(' ').toLowerCase();

    // Content that supports practical application
    if (topicsText.includes('process') || topicsText.includes('procedure')) applicationScore += 15;
    if (topicsText.includes('software') || topicsText.includes('tool')) applicationScore += 12;
    if (topicsText.includes('technique') || topicsText.includes('method')) applicationScore += 10;
    if (topicsText.includes('best practice') || topicsText.includes('guideline')) applicationScore += 8;
    if (topicsText.includes('case study') || topicsText.includes('example')) applicationScore += 10;

    score += Math.min(applicationScore, 100) * 0.2;

    // Assessment and Measurement Potential (15 points)
    let assessmentScore = 70; // Base score

    // Domain-specific assessment potential
    const domain = (contentAnalysis.contentDomain || '').toLowerCase();
    const assessmentByDomain = {
        'technical training': 90,        // Clear skills to assess
        'compliance training': 95,       // Required assessment
        'software training': 88,         // Performance-based assessment
        'healthcare training': 92,       // Critical competency assessment
        'business training': 85,         // Case-based assessment
        'sales training': 88,           // Performance metrics available
        'safety training': 90           // Critical compliance assessment
    };

    const domainAssessment = assessmentByDomain[domain] || 75;
    assessmentScore = Math.max(assessmentScore, domainAssessment);

    score += Math.min(assessmentScore, 100) * 0.15;

    // SME Support for Learning Goals (10 points)
    let smeSupporScore = 75; // Base score

    if (smeInterview && smeInterview.answers) {
        const answersText = Object.values(smeInterview.answers).join(' ').toLowerCase();

        // Indicators of strong learning focus
        if (answersText.includes('objective') || answersText.includes('goal')) smeSupporScore += 10;
        if (answersText.includes('assess') || answersText.includes('measure')) smeSupporScore += 10;
        if (answersText.includes('skill') || answersText.includes('competenc')) smeSupporScore += 8;
        if (answersText.includes('performance') || answersText.includes('result')) smeSupporScore += 8;
        if (answersText.includes('apply') || answersText.includes('practice')) smeSupporScore += 5;
    }

    score += Math.min(smeSupporScore, 100) * 0.1;

    // Learning Retention Factors (10 points)
    let retentionScore = 70; // Base score

    // Factors that support retention
    if (complexity === 'medium') retentionScore += 10; // Optimal cognitive load
    if (contentType.includes('practical') || contentType.includes('applied')) retentionScore += 10;

    const fileCount = contentAnalysis.fileCount || 1;
    if (fileCount > 1) retentionScore += 5; // Multiple reinforcement sources

    score += Math.min(retentionScore, 100) * 0.1;

    return Math.min(score, maxScore);
}

function generateScoringRecommendations(contentSuitability, engagementPotential, learningEffectiveness) {
    const recommendations = [];

    // Content Suitability Recommendations
    if (contentSuitability < 70) {
        recommendations.push({
            category: 'Content Suitability',
            priority: 'High',
            recommendation: 'Enhance content structure and organization. Consider breaking complex topics into smaller, digestible modules.',
            expectedImprovement: '+15-20 points'
        });
    } else if (contentSuitability < 85) {
        recommendations.push({
            category: 'Content Suitability',
            priority: 'Medium',
            recommendation: 'Add more detailed examples and clarify technical terminology to improve content accessibility.',
            expectedImprovement: '+10-15 points'
        });
    }

    // Engagement Potential Recommendations
    if (engagementPotential < 75) {
        recommendations.push({
            category: 'Engagement Potential',
            priority: 'High',
            recommendation: 'Incorporate interactive elements such as scenarios, simulations, or gamification to boost learner engagement.',
            expectedImprovement: '+20-25 points'
        });
    } else if (engagementPotential < 85) {
        recommendations.push({
            category: 'Engagement Potential',
            priority: 'Medium',
            recommendation: 'Add multimedia elements and real-world case studies to enhance learner connection to the material.',
            expectedImprovement: '+10-15 points'
        });
    }

    // Learning Effectiveness Recommendations
    if (learningEffectiveness < 75) {
        recommendations.push({
            category: 'Learning Effectiveness',
            priority: 'High',
            recommendation: 'Define clear learning objectives and add formative assessments throughout the course to track progress.',
            expectedImprovement: '+18-22 points'
        });
    } else if (learningEffectiveness < 85) {
        recommendations.push({
            category: 'Learning Effectiveness',
            priority: 'Medium',
            recommendation: 'Include more practical application exercises and peer collaboration opportunities.',
            expectedImprovement: '+10-15 points'
        });
    }

    return recommendations;
}

export default {
    calculateContentScores,
    calculateContentSuitability,
    calculateEngagementPotential,
    calculateLearningEffectiveness,
    generateScoringRecommendations
};