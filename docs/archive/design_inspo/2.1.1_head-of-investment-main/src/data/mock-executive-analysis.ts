import { ExecutiveAnalysis } from '@/types/executive-intelligence';

export const MOCK_EXECUTIVE_ANALYSIS: ExecutiveAnalysis = {
  id: 'exec-001',
  executiveName: 'Elon Musk',
  company: 'Tesla Inc.',
  role: 'CEO',
  videoUrl: '',
  duration: 342,
  analyzedAt: new Date(),
  transcript: [
    {
      id: 't1',
      timestamp: 0,
      endTime: 8,
      text: "We're seeing tremendous momentum in our energy storage business, and I'm extremely confident about the trajectory we're on.",
      speaker: 'Elon Musk',
      confidence: 0.95,
      linguisticFlags: [
        { type: 'confidence', phrase: 'tremendous momentum', severity: 'low' },
        { type: 'confidence', phrase: 'extremely confident', severity: 'low' }
      ]
    },
    {
      id: 't2',
      timestamp: 8,
      endTime: 18,
      text: "I think, maybe, we might see some improvements in the supply chain situation, but it's hard to say exactly when.",
      speaker: 'Elon Musk',
      confidence: 0.92,
      linguisticFlags: [
        { type: 'hedging', phrase: 'I think, maybe', severity: 'high' },
        { type: 'uncertainty', phrase: 'might see', severity: 'medium' },
        { type: 'hedging', phrase: "it's hard to say", severity: 'medium' }
      ]
    },
    {
      id: 't3',
      timestamp: 18,
      endTime: 28,
      text: "Our autonomous driving capabilities are advancing rapidly. Full Self-Driving is making significant progress every quarter.",
      speaker: 'Elon Musk',
      confidence: 0.97,
      linguisticFlags: [
        { type: 'confidence', phrase: 'advancing rapidly', severity: 'low' }
      ]
    },
    {
      id: 't4',
      timestamp: 28,
      endTime: 40,
      text: "Regarding the CFO transition, well, these things happen in business. Let me redirect to our production numbers which are fantastic.",
      speaker: 'Elon Musk',
      confidence: 0.88,
      linguisticFlags: [
        { type: 'deflection', phrase: 'Let me redirect', severity: 'high' },
        { type: 'hedging', phrase: 'these things happen', severity: 'medium' }
      ]
    },
    {
      id: 't5',
      timestamp: 40,
      endTime: 52,
      text: "We're on track to achieve our guidance, probably, assuming market conditions remain favorable. The macro environment is challenging.",
      speaker: 'Elon Musk',
      confidence: 0.85,
      linguisticFlags: [
        { type: 'hedging', phrase: 'probably, assuming', severity: 'high' },
        { type: 'uncertainty', phrase: 'challenging', severity: 'medium' }
      ]
    },
    {
      id: 't6',
      timestamp: 52,
      endTime: 65,
      text: "Our margin profile will definitely improve. We have clear visibility into cost reductions and manufacturing efficiencies.",
      speaker: 'Elon Musk',
      confidence: 0.94,
      linguisticFlags: [
        { type: 'confidence', phrase: 'definitely improve', severity: 'low' },
        { type: 'confidence', phrase: 'clear visibility', severity: 'low' }
      ]
    },
    {
      id: 't7',
      timestamp: 65,
      endTime: 78,
      text: "I can't really comment on the specific timeline for that project. There are various factors we're still evaluating internally.",
      speaker: 'Elon Musk',
      confidence: 0.82,
      linguisticFlags: [
        { type: 'deflection', phrase: "can't really comment", severity: 'high' },
        { type: 'uncertainty', phrase: 'still evaluating', severity: 'medium' }
      ]
    },
    {
      id: 't8',
      timestamp: 78,
      endTime: 90,
      text: "The Cybertruck is absolutely going to revolutionize the pickup market. Our reservation numbers speak for themselves.",
      speaker: 'Elon Musk',
      confidence: 0.96,
      linguisticFlags: [
        { type: 'confidence', phrase: 'absolutely going to revolutionize', severity: 'low' }
      ]
    }
  ],
  bodyCues: [
    { 
      timestamp: 12, 
      type: 'eye_contact', 
      description: 'Briefly avoids camera when discussing supply chain', 
      sentiment: 'negative' 
    },
    { 
      timestamp: 25, 
      type: 'gesture', 
      description: 'Open palm gesture indicating transparency about FSD', 
      sentiment: 'positive' 
    },
    { 
      timestamp: 32, 
      type: 'posture', 
      description: 'Shifts position when CFO topic raised', 
      sentiment: 'negative' 
    },
    { 
      timestamp: 45, 
      type: 'micro_expression', 
      description: 'Brief tension in jaw when discussing margins', 
      sentiment: 'neutral' 
    },
    { 
      timestamp: 58, 
      type: 'gesture', 
      description: 'Confident hand movements during cost discussion', 
      sentiment: 'positive' 
    },
    { 
      timestamp: 70, 
      type: 'eye_contact', 
      description: 'Looks down when avoiding timeline question', 
      sentiment: 'negative' 
    },
    { 
      timestamp: 82, 
      type: 'posture', 
      description: 'Leans forward with enthusiasm about Cybertruck', 
      sentiment: 'positive' 
    }
  ],
  redFlags: [
    {
      id: 'rf1',
      category: 'financial',
      title: 'Vague Margin Guidance',
      description: 'Executive used hedging language when discussing Q4 margin targets, avoiding specific numbers while using qualitative descriptors.',
      severity: 'warning',
      relatedTimestamps: [40, 52]
    },
    {
      id: 'rf2',
      category: 'leadership',
      title: 'CFO Transition Deflection',
      description: 'When asked about CFO departure, subject immediately redirected to production numbers, avoiding direct engagement with the question.',
      severity: 'critical',
      relatedTimestamps: [28]
    },
    {
      id: 'rf3',
      category: 'operational',
      title: 'Supply Chain Uncertainty',
      description: 'High concentration of hedging phrases when discussing supply chain improvements, suggesting internal uncertainty.',
      severity: 'warning',
      relatedTimestamps: [8]
    },
    {
      id: 'rf4',
      category: 'operational',
      title: 'Project Timeline Avoidance',
      description: 'Explicit refusal to provide timeline specifics, citing ongoing internal evaluation.',
      severity: 'info',
      relatedTimestamps: [65]
    }
  ],
  followUpQuestions: [
    {
      id: 'fq1',
      question: 'Can you provide specific gross margin targets for Q4 2025?',
      context: 'Executive used hedging language when discussing margins, avoiding concrete numbers',
      priority: 'high'
    },
    {
      id: 'fq2',
      question: 'What is the timeline for the CFO replacement search and what qualities are you prioritizing?',
      context: 'Topic was deflected during Q&A, suggesting potential sensitivity',
      priority: 'high'
    },
    {
      id: 'fq3',
      question: 'What specific supply chain constraints are you currently facing and what is your mitigation strategy?',
      context: 'Vague language around supply chain improvements',
      priority: 'medium'
    },
    {
      id: 'fq4',
      question: 'What internal factors are being evaluated for the undisclosed project timeline?',
      context: 'Executive explicitly avoided providing timeline details',
      priority: 'medium'
    },
    {
      id: 'fq5',
      question: 'How do you define "favorable market conditions" for achieving guidance?',
      context: 'Guidance was conditional on undefined market factors',
      priority: 'low'
    }
  ],
  overallSentiment: {
    confidence: 72,
    hedging: 34,
    transparency: 61
  }
};
