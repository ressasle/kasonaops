export interface LinguisticFlag {
  type: 'hedging' | 'confidence' | 'deflection' | 'uncertainty';
  phrase: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TranscriptSegment {
  id: string;
  timestamp: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence?: number;
  linguisticFlags?: LinguisticFlag[];
}

export interface BodyLanguageCue {
  timestamp: number;
  type: 'eye_contact' | 'gesture' | 'posture' | 'micro_expression';
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface RedFlag {
  id: string;
  category: 'financial' | 'operational' | 'leadership' | 'legal';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  relatedTimestamps: number[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  priority: 'high' | 'medium' | 'low';
}

// Trust Index from n8n analysis
export interface TrustIndex {
  totalScore: number;
  tier: 'High Conviction' | 'Verify & Validate' | 'Distressed/Risk' | string;
  rationale: string;
  components: {
    verbalSpecificity: number;
    vocalStability: number;
    visualCongruence: number;
  };
}

// Communication score from n8n analysis
export interface CommunicationScore {
  clarity: number;
  confidence: number;
  authenticity: number;
}

// Key finding from n8n analysis
export interface KeyFinding {
  id: string;
  timestamp: string;
  claim: string;
  linguisticSignal: string;
  visualCue: string;
  investorAction: string;
}

export interface ExecutiveAnalysis {
  id: string;
  executiveName: string;
  company: string;
  role: string;
  videoUrl: string;
  youtubeUrl?: string;
  duration: number;
  analyzedAt: Date | string;
  
  // Legacy transcript-based analysis (mock data)
  transcript: TranscriptSegment[];
  bodyCues: BodyLanguageCue[];
  redFlags: RedFlag[];
  followUpQuestions: FollowUpQuestion[];
  overallSentiment: {
    confidence: number;
    hedging: number;
    transparency: number;
  };
  
  // New n8n-based analysis
  trustIndex?: TrustIndex;
  communicationScore?: CommunicationScore;
  keyFindings?: KeyFinding[];
  executiveSummary?: string;
  
  // For storage
  accountId?: string;
  rawResponse?: unknown;
}

export type ViewState = 'upload' | 'processing' | 'results';

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

// API response from edge function
export interface VideoAnalysisResponse {
  id: string;
  youtubeUrl: string;
  accountId?: string;
  analyzedAt: string;
  trustIndex: TrustIndex;
  executiveSummary: string;
  communicationScore: CommunicationScore;
  keyFindings: KeyFinding[];
  followUpQuestions: FollowUpQuestion[];
  overallSentiment: {
    confidence: number;
    hedging: number;
    transparency: number;
  };
  rawResponse?: unknown;
}
