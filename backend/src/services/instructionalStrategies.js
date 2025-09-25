// Instructional Design Strategy Engine
// Based on comprehensive instructional design framework

export const INSTRUCTIONAL_STRATEGIES = {
  MICROLEARNING: {
    name: 'Microlearning Strategy',
    description: 'Delivers content in small, focused bursts (5-10 minutes) perfect for busy professionals or quick skill updates.',
    useCases: [
      'Software training and product updates',
      'Compliance refreshers and policy updates',
      'Just-in-time learning for field workers',
      'Quick skill reinforcement',
      'Technology rollouts'
    ],
    idealFor: {
      learnerTypes: ['busy professionals', 'field workers', 'remote employees'],
      contentTypes: ['procedural knowledge', 'facts', 'quick references', 'product training'],
      timeConstraints: 'limited',
      complexity: 'low-to-medium'
    },
    implementation: {
      formats: ['short videos', 'infographics', 'quick quizzes', 'tip cards'],
      duration: '5-10 minutes',
      delivery: 'mobile-optimized, bite-sized chunks'
    },
    icon: 'schedule',
    color: 'blue',
    contentTypeMatch: {
      'software training': 95,
      'product training': 90,
      'compliance training': 85,
      'technical skills': 80,
      'onboarding': 75
    }
  },

  STORY_BASED: {
    name: 'Story-Based Learning Strategy',
    description: 'Uses narrative elements to create emotional connections and engagement, making content relatable and memorable.',
    useCases: [
      'Soft skills and leadership training',
      'Cultural change initiatives',
      'Ethics and compliance training',
      'Customer service scenarios',
      'Behavioral change programs'
    ],
    idealFor: {
      learnerTypes: ['all levels', 'adult learners', 'visual learners'],
      contentTypes: ['soft skills', 'behavioral concepts', 'cultural values'],
      timeConstraints: 'flexible',
      complexity: 'medium-to-high'
    },
    implementation: {
      formats: ['narrative videos', 'character-driven scenarios', 'case studies'],
      duration: '15-30 minutes',
      delivery: 'multimedia storytelling with emotional hooks'
    },
    icon: 'auto_stories',
    color: 'purple'
  },

  SCENARIO_BASED: {
    name: 'Scenario-Based Learning Strategy',
    description: 'Immerses learners in real-life situations for decision-making practice and critical thinking development.',
    useCases: [
      'Compliance training and ethical dilemmas',
      'Healthcare decision-making',
      'Customer service training',
      'Safety protocols and emergency response',
      'Leadership and management skills'
    ],
    idealFor: {
      learnerTypes: ['experienced professionals', 'decision-makers'],
      contentTypes: ['procedural knowledge', 'problem-solving', 'critical thinking'],
      timeConstraints: 'moderate',
      complexity: 'medium-to-high'
    },
    implementation: {
      formats: ['branching scenarios', 'simulation exercises', 'decision trees'],
      duration: '20-45 minutes',
      delivery: 'interactive decision-making environments'
    },
    icon: 'account_tree',
    color: 'green'
  },

  CASE_BASED: {
    name: 'Case-Based Learning Strategy',
    description: 'Puts learners in decision-maker roles to strengthen critical thinking and practical application skills.',
    useCases: [
      'Leadership development programs',
      'Compliance and regulatory training',
      'Sustainability and environmental training',
      'Crisis management and resolution',
      'Strategic business decisions'
    ],
    idealFor: {
      learnerTypes: ['senior professionals', 'managers', 'experts'],
      contentTypes: ['complex analysis', 'judgment calls', 'strategic thinking'],
      timeConstraints: 'extended',
      complexity: 'high'
    },
    implementation: {
      formats: ['real case studies', 'problem analysis', 'group discussions'],
      duration: '45-90 minutes',
      delivery: 'in-depth analysis with peer collaboration'
    },
    icon: 'gavel',
    color: 'orange'
  },

  GAMIFICATION: {
    name: 'Gamification Strategy',
    description: 'Incorporates game elements (points, badges, leaderboards) to improve motivation and sustained engagement.',
    useCases: [
      'Employee onboarding programs',
      'Sales training and competitions',
      'Policy training and compliance',
      'Product knowledge training',
      'Skill certification programs'
    ],
    idealFor: {
      learnerTypes: ['competitive learners', 'younger demographics', 'sales teams'],
      contentTypes: ['repetitive content', 'skill building', 'knowledge retention'],
      timeConstraints: 'flexible',
      complexity: 'low-to-medium'
    },
    implementation: {
      formats: ['point systems', 'achievement badges', 'progress tracking', 'competitions'],
      duration: 'ongoing engagement',
      delivery: 'interactive platforms with reward systems'
    },
    icon: 'sports_esports',
    color: 'red'
  },

  BLENDED_LEARNING: {
    name: 'Blended Learning Strategy',
    description: 'Combines online digital media with traditional face-to-face instruction for comprehensive learning.',
    useCases: [
      'Academic courses with practical components',
      'Professional certification programs',
      'Technical training with hands-on practice',
      'Leadership development programs',
      'Complex skill development'
    ],
    idealFor: {
      learnerTypes: ['all levels', 'formal education', 'professional development'],
      contentTypes: ['comprehensive subjects', 'skill + knowledge', 'certification prep'],
      timeConstraints: 'structured schedule',
      complexity: 'medium-to-high'
    },
    implementation: {
      formats: ['online modules + workshops', 'virtual + in-person sessions'],
      duration: 'extended programs (weeks/months)',
      delivery: 'hybrid delivery with scheduled touchpoints'
    },
    icon: 'school',
    color: 'indigo'
  },

  SPACED_LEARNING: {
    name: 'Spaced Learning Strategy',
    description: 'Uses periodic reinforcement and review intervals to improve long-term retention and recall.',
    useCases: [
      'Language learning programs',
      'Medical and healthcare training',
      'Technical certification maintenance',
      'Safety training reinforcement',
      'Academic exam preparation'
    ],
    idealFor: {
      learnerTypes: ['all levels', 'certification seekers', 'academic learners'],
      contentTypes: ['factual knowledge', 'procedures', 'complex concepts'],
      timeConstraints: 'long-term commitment',
      complexity: 'any level'
    },
    implementation: {
      formats: ['spaced repetition', 'periodic reviews', 'progressive disclosure'],
      duration: 'extended timeline with intervals',
      delivery: 'scheduled reinforcement cycles'
    },
    icon: 'repeat',
    color: 'teal'
  },

  COLLABORATIVE: {
    name: 'Collaborative Learning Strategy',
    description: 'Encourages peer interaction, teamwork, discussions, and knowledge sharing through group activities.',
    useCases: [
      'Team building and collaboration skills',
      'Knowledge sharing sessions',
      'Project-based learning',
      'Peer mentoring programs',
      'Community of practice development'
    ],
    idealFor: {
      learnerTypes: ['team members', 'social learners', 'experienced professionals'],
      contentTypes: ['soft skills', 'collaborative projects', 'knowledge exchange'],
      timeConstraints: 'group-dependent',
      complexity: 'medium'
    },
    implementation: {
      formats: ['group projects', 'peer discussions', 'collaborative platforms'],
      duration: 'varies by group dynamics',
      delivery: 'social learning environments'
    },
    icon: 'groups',
    color: 'cyan'
  },

  SIMULATION_VIRTUAL_LABS: {
    name: 'Simulation & Virtual Labs Strategy',
    description: 'Provides hands-on practice via realistic simulations without real-world risks or costs.',
    useCases: [
      'Technical and engineering training',
      'Medical procedures and diagnostics',
      'Safety training and emergency response',
      'Equipment operation training',
      'High-risk scenario practice'
    ],
    idealFor: {
      learnerTypes: ['technical professionals', 'hands-on learners', 'safety-critical roles'],
      contentTypes: ['procedural skills', 'technical operations', 'safety protocols'],
      timeConstraints: 'dedicated practice time',
      complexity: 'high'
    },
    implementation: {
      formats: ['3D simulations', 'virtual reality', 'interactive labs'],
      duration: 'intensive practice sessions',
      delivery: 'immersive virtual environments'
    },
    icon: 'precision_manufacturing',
    color: 'deep-purple'
  },

  ADAPTIVE_LEARNING: {
    name: 'Adaptive Learning Strategy',
    description: 'Uses technology to personalize learning paths based on individual performance and needs.',
    useCases: [
      'Diverse skill level groups',
      'Self-paced learning programs',
      'Remedial and advanced tracks',
      'Competency-based training',
      'Large-scale training initiatives'
    ],
    idealFor: {
      learnerTypes: ['mixed ability groups', 'self-directed learners', 'diverse backgrounds'],
      contentTypes: ['any content requiring personalization'],
      timeConstraints: 'flexible, self-paced',
      complexity: 'any level'
    },
    implementation: {
      formats: ['AI-driven platforms', 'branching content', 'performance analytics'],
      duration: 'adaptive to learner needs',
      delivery: 'intelligent learning systems'
    },
    icon: 'psychology',
    color: 'pink'
  },

  MOBILE_LEARNING: {
    name: 'Mobile Learning Strategy',
    description: 'Designs content optimized for mobile devices and on-the-go access for maximum flexibility.',
    useCases: [
      'Field worker training',
      'Remote employee development',
      'Just-in-time reference materials',
      'Travel-friendly learning',
      'Flexible schedule accommodation'
    ],
    idealFor: {
      learnerTypes: ['mobile workforce', 'remote employees', 'busy professionals'],
      contentTypes: ['reference materials', 'quick procedures', 'micro-content'],
      timeConstraints: 'very flexible',
      complexity: 'low-to-medium'
    },
    implementation: {
      formats: ['mobile apps', 'responsive design', 'offline capability'],
      duration: 'short, flexible sessions',
      delivery: 'mobile-first design approach'
    },
    icon: 'smartphone',
    color: 'light-green'
  },

  SOCIAL_LEARNING: {
    name: 'Social Learning Strategy',
    description: 'Incorporates informal learning via social media, forums, and communities of practice.',
    useCases: [
      'Knowledge community building',
      'Peer mentoring and support',
      'Best practice sharing',
      'Informal skill development',
      'Organizational culture building'
    ],
    idealFor: {
      learnerTypes: ['social learners', 'experienced professionals', 'community members'],
      contentTypes: ['tacit knowledge', 'best practices', 'cultural learning'],
      timeConstraints: 'ongoing, informal',
      complexity: 'medium'
    },
    implementation: {
      formats: ['discussion forums', 'social platforms', 'communities of practice'],
      duration: 'ongoing engagement',
      delivery: 'social networking environments'
    },
    icon: 'forum',
    color: 'amber'
  },

  ASSESSMENT_DRIVEN: {
    name: 'Assessment-Driven Strategy',
    description: 'Designs formative and summative assessments aligned with objectives to guide learning and measure outcomes.',
    useCases: [
      'Certification and compliance training',
      'Performance measurement programs',
      'Quality assurance training',
      'Competency validation',
      'Progress tracking initiatives'
    ],
    idealFor: {
      learnerTypes: ['certification seekers', 'regulated professions', 'quality-focused roles'],
      contentTypes: ['measurable skills', 'compliance requirements', 'standards'],
      timeConstraints: 'assessment schedules',
      complexity: 'any level'
    },
    implementation: {
      formats: ['pre/post assessments', 'progressive evaluations', 'competency checks'],
      duration: 'structured assessment cycles',
      delivery: 'measurement-focused learning paths'
    },
    icon: 'assignment_turned_in',
    color: 'brown',
    contentTypeMatch: {
      'compliance training': 95,
      'certification': 90,
      'quality assurance': 85,
      'standards training': 80
    }
  },

  GUIDED_LEARNING: {
    name: 'Guided Learning Strategy',
    description: 'Uses characters/avatars to guide learners through courses, establishing personal connection and motivation.',
    useCases: [
      'Sales training programs',
      'Software application training',
      'Process training and workflows',
      'New employee onboarding',
      'Complex procedural training'
    ],
    idealFor: {
      learnerTypes: ['new employees', 'visual learners', 'guided preference learners'],
      contentTypes: ['processes', 'software applications', 'procedures'],
      timeConstraints: 'structured',
      complexity: 'medium'
    },
    implementation: {
      formats: ['avatar-guided tours', 'step-by-step walkthroughs', 'interactive tutorials'],
      duration: '15-30 minutes per module',
      delivery: 'character-driven narrative learning'
    },
    icon: 'person_pin',
    color: 'purple',
    contentTypeMatch: {
      'sales training': 95,
      'software training': 90,
      'process training': 85,
      'onboarding': 80
    }
  },

  LEARNING_THROUGH_EXPLORATION: {
    name: 'Learning Through Exploration & Discovery (LEAD)',
    description: 'Encourages self-directed learning and promotes independent problem-solving through discovery.',
    useCases: [
      'Leadership development programs',
      'Sustainability education',
      'Innovation and creativity training',
      'Research methodology training',
      'Strategic thinking development'
    ],
    idealFor: {
      learnerTypes: ['self-directed learners', 'experienced professionals', 'leaders'],
      contentTypes: ['strategic thinking', 'leadership concepts', 'research methods'],
      timeConstraints: 'flexible, extended',
      complexity: 'high'
    },
    implementation: {
      formats: ['exploratory interfaces', 'research projects', 'discovery modules'],
      duration: '45-90 minutes',
      delivery: 'self-paced exploration environments'
    },
    icon: 'explore',
    color: 'green',
    contentTypeMatch: {
      'leadership training': 95,
      'sustainability': 90,
      'strategic planning': 85,
      'innovation': 80
    }
  }
};

// Strategy matching algorithm based on content analysis and SME responses
export function recommendStrategies(contentAnalysis, smeInterview, options = {}) {
  const maxRecommendations = options.maxRecommendations || 5;
  const strategies = Object.values(INSTRUCTIONAL_STRATEGIES);
  const scores = strategies.map(strategy => ({
    strategy,
    score: calculateStrategyScore(strategy, contentAnalysis, smeInterview),
    reasoning: generateReasoning(strategy, contentAnalysis, smeInterview)
  }));

  // Sort by score and return top recommendations
  const recommendations = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations)
    .map((item, index) => ({
      id: index + 1,
      title: item.strategy.name,
      description: item.strategy.description,
      icon: item.strategy.icon,
      color: item.strategy.color,
      score: item.score,
      reasoning: item.reasoning,
      useCases: item.strategy.useCases,
      implementation: item.strategy.implementation,
      idealFor: item.strategy.idealFor
    }));

  return recommendations;
}

function calculateStrategyScore(strategy, contentAnalysis, smeInterview) {
  let score = 0;
  const maxScore = 100;

  // Analyze content characteristics (40% of score)
  score += analyzeContentMatch(strategy, contentAnalysis) * 0.4;

  // Analyze SME preferences and responses (35% of score)
  score += analyzeSMEMatch(strategy, smeInterview) * 0.35;

  // Consider implementation feasibility (15% of score)
  score += analyzeImplementationFeasibility(strategy, contentAnalysis) * 0.15;

  // Bonus for innovative approaches (10% of score)
  score += analyzeInnovationBonus(strategy, contentAnalysis) * 0.1;

  return Math.min(score, maxScore);
}

function analyzeContentMatch(strategy, contentAnalysis) {
  let contentScore = 0;
  const topics = contentAnalysis.extractedTopics || [];
  const complexity = contentAnalysis.complexityLevel || 'medium';
  const contentType = contentAnalysis.primaryContentType || 'document';

  // Enhanced content type matching using contentTypeMatch scores
  if (strategy.contentTypeMatch) {
    const topicsText = topics.join(' ').toLowerCase();
    const contentTypeText = contentType.toLowerCase();

    // Check for direct matches in contentTypeMatch
    let bestMatch = 0;
    for (const [matchType, score] of Object.entries(strategy.contentTypeMatch)) {
      if (topicsText.includes(matchType.toLowerCase()) ||
          contentTypeText.includes(matchType.toLowerCase())) {
        bestMatch = Math.max(bestMatch, score);
      }
    }

    // Use the best match score, scaled to our scoring system
    if (bestMatch > 0) {
      contentScore += (bestMatch / 100) * 50; // Scale to 50 points max
    }
  }

  // Match complexity level (enhanced)
  const strategyComplexity = strategy.idealFor.complexity;
  if (strategyComplexity === 'any level') {
    contentScore += 25;
  } else if (strategyComplexity.includes(complexity)) {
    contentScore += 30; // Higher score for exact complexity match
  } else if (
    (complexity === 'low' && strategyComplexity.includes('medium')) ||
    (complexity === 'medium' && (strategyComplexity.includes('low') || strategyComplexity.includes('high'))) ||
    (complexity === 'high' && strategyComplexity.includes('medium'))
  ) {
    contentScore += 15; // Partial match for adjacent complexity levels
  }

  // Enhanced keyword matching
  const topicsText = topics.join(' ').toLowerCase();
  const contentKeywords = {
    'technical': ['simulation', 'virtual', 'hands-on'],
    'software': ['microlearning', 'guided', 'simulation'],
    'leadership': ['case', 'scenario', 'exploration'],
    'compliance': ['assessment', 'scenario', 'case'],
    'sales': ['gamification', 'guided', 'story'],
    'onboarding': ['guided', 'microlearning', 'gamification'],
    'process': ['guided', 'microlearning', 'collaborative']
  };

  for (const [keyword, strategies] of Object.entries(contentKeywords)) {
    if (topicsText.includes(keyword)) {
      const strategyName = strategy.name.toLowerCase();
      for (const strategyKeyword of strategies) {
        if (strategyName.includes(strategyKeyword)) {
          contentScore += 15;
          break; // Only add bonus once per strategy
        }
      }
    }
  }

  // Bonus for versatile strategies
  if (strategy.idealFor.contentTypes.includes('any content') ||
      strategy.idealFor.contentTypes.length > 4) {
    contentScore += 10;
  }

  return Math.min(contentScore, 100);
}

function analyzeSMEMatch(strategy, smeInterview) {
  let smeScore = 0;
  const answers = smeInterview.answers || {};
  const answersText = Object.values(answers).join(' ').toLowerCase();

  // Analyze SME preferences from responses
  const preferences = {
    interactive: answersText.includes('interactive') || answersText.includes('engage'),
    practical: answersText.includes('practical') || answersText.includes('hands-on'),
    assessment: answersText.includes('assess') || answersText.includes('test'),
    scenarios: answersText.includes('scenario') || answersText.includes('real-world'),
    mobile: answersText.includes('mobile') || answersText.includes('flexible'),
    collaboration: answersText.includes('team') || answersText.includes('group'),
    time_constrained: answersText.includes('busy') || answersText.includes('quick'),
    gamified: answersText.includes('motivat') || answersText.includes('reward'),
    story_based: answersText.includes('story') || answersText.includes('narrative')
  };

  // Score based on preference alignment
  if (preferences.interactive && strategy.name.toLowerCase().includes('gamification')) smeScore += 20;
  if (preferences.practical && strategy.name.toLowerCase().includes('scenario')) smeScore += 20;
  if (preferences.assessment && strategy.name.toLowerCase().includes('assessment')) smeScore += 20;
  if (preferences.scenarios && strategy.name.toLowerCase().includes('case')) smeScore += 20;
  if (preferences.mobile && strategy.name.toLowerCase().includes('mobile')) smeScore += 20;
  if (preferences.collaboration && strategy.name.toLowerCase().includes('collaborative')) smeScore += 20;
  if (preferences.time_constrained && strategy.name.toLowerCase().includes('micro')) smeScore += 20;
  if (preferences.gamified && strategy.name.toLowerCase().includes('gamification')) smeScore += 20;
  if (preferences.story_based && strategy.name.toLowerCase().includes('story')) smeScore += 20;

  // Completion bonus
  const completionRate = smeInterview.completionPercentage || 0;
  smeScore += completionRate * 0.3; // Up to 30 points for high completion

  return Math.min(smeScore, 100);
}

function analyzeImplementationFeasibility(strategy, contentAnalysis) {
  let feasibilityScore = 50; // Base feasibility

  // Consider file count and complexity
  const fileCount = contentAnalysis.fileCount || 1;
  const complexity = contentAnalysis.complexityLevel || 'medium';

  // Adjust based on resource requirements
  if (strategy.implementation.duration.includes('intensive') && fileCount > 10) {
    feasibilityScore += 20; // Good fit for extensive content
  }
  if (strategy.implementation.duration.includes('short') && complexity === 'low') {
    feasibilityScore += 30; // Perfect for simple, quick content
  }
  if (strategy.implementation.formats.includes('3D simulations') && complexity === 'low') {
    feasibilityScore -= 20; // Overkill for simple content
  }

  return Math.min(feasibilityScore, 100);
}

function analyzeInnovationBonus(strategy, contentAnalysis) {
  let innovationScore = 0;

  // Bonus for cutting-edge strategies
  if (strategy.name.toLowerCase().includes('adaptive')) innovationScore += 30;
  if (strategy.name.toLowerCase().includes('virtual') || strategy.name.toLowerCase().includes('simulation')) innovationScore += 25;
  if (strategy.name.toLowerCase().includes('ai') || strategy.name.toLowerCase().includes('intelligent')) innovationScore += 20;

  return Math.min(innovationScore, 100);
}

function generateReasoning(strategy, contentAnalysis, smeInterview) {
  const topics = contentAnalysis.extractedTopics || ['content'];
  const answers = smeInterview.answers || {};
  const answersText = Object.values(answers).join(' ').toLowerCase();

  let reasoning = `This strategy is recommended because: `;

  // Content-based reasoning
  if (topics.length > 0) {
    reasoning += `Your content focuses on ${topics.slice(0, 2).join(' and ')}, which aligns well with ${strategy.name.toLowerCase()}. `;
  }

  // SME preference-based reasoning
  if (answersText.includes('interactive')) {
    reasoning += `Your emphasis on interactive learning makes this strategy particularly suitable. `;
  }
  if (answersText.includes('practical')) {
    reasoning += `The practical, hands-on approach you prefer is well-served by this strategy. `;
  }
  if (answersText.includes('busy') || answersText.includes('time')) {
    reasoning += `This strategy accommodates time constraints mentioned in your responses. `;
  }

  // Strategy-specific benefits
  reasoning += `${strategy.description.split('.')[0]}.`;

  return reasoning;
}