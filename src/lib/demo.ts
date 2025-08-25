import { readFileSync } from 'fs';
import { join } from 'path';
import { isDemoMode } from './env';

export interface DemoFeedback {
  id: string;
  text: string;
  source: string;
  user_segment: string;
  product_area: string;
  sentiment: number;
  urgency: number;
  business_impact: number;
  themes: string[];
  confidence: number;
  created_at: string;
}

export interface DemoCluster {
  id: string;
  title: string;
  description: string;
  theme: string;
  sentiment_trend: string;
  urgency_level: string;
  affected_segments: string[];
  affected_areas: string[];
  business_impact: string;
  priority: number;
  feedback_count: number;
  avg_sentiment: number;
  indices: number[];
  example_quotes: string[];
}

// Simulate loading and processing delay for demo
export const simulateDelay = (ms: number = 1500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Load demo feedback from fixtures
export function loadDemoFeedback(): DemoFeedback[] {
  if (!isDemoMode()) return [];
  
  try {
    const fixturePath = join(process.cwd(), 'fixtures', 'sample-feedback.json');
    const data = readFileSync(fixturePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load demo feedback:', error);
    return [];
  }
}

// Load demo clusters from fixtures
export function loadDemoClusters(): DemoCluster[] {
  if (!isDemoMode()) return [];
  
  try {
    const fixturePath = join(process.cwd(), 'fixtures', 'sample-clusters.json');
    const data = readFileSync(fixturePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load demo clusters:', error);
    return [];
  }
}

// Mock analysis result for demo mode
export function createDemoAnalysis(text: string): {
  sentiment: number;
  urgency: number;
  business_impact: number;
  themes: string[];
  confidence: number;
} {
  // Simple mock analysis based on keywords
  const lowerText = text.toLowerCase();
  
  // Sentiment analysis
  const positiveWords = ['love', 'great', 'fantastic', 'excellent', 'amazing', 'good', 'better', 'improved'];
  const negativeWords = ['slow', 'crash', 'issue', 'problem', 'bug', 'broken', 'difficult', 'confusing'];
  
  const positiveScore = positiveWords.reduce((score, word) => 
    lowerText.includes(word) ? score + 0.2 : score, 0);
  const negativeScore = negativeWords.reduce((score, word) => 
    lowerText.includes(word) ? score + 0.2 : score, 0);
  
  const sentiment = Math.max(0, Math.min(1, 0.5 + positiveScore - negativeScore));
  
  // Urgency analysis
  const urgentWords = ['critical', 'urgent', 'blocking', 'crash', 'security', 'compliance'];
  const urgency = urgentWords.some(word => lowerText.includes(word)) ? 
    Math.random() * 0.4 + 0.6 : Math.random() * 0.5;
  
  // Business impact
  const highImpactWords = ['enterprise', 'team', 'users', 'security', 'compliance', 'integration'];
  const business_impact = highImpactWords.some(word => lowerText.includes(word)) ? 
    Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 1;
  
  // Themes extraction
  const themes: string[] = [];
  if (lowerText.includes('dashboard') || lowerText.includes('ui')) themes.push('ui');
  if (lowerText.includes('mobile') || lowerText.includes('app')) themes.push('mobile');
  if (lowerText.includes('search')) themes.push('search');
  if (lowerText.includes('performance') || lowerText.includes('slow')) themes.push('performance');
  if (lowerText.includes('security') || lowerText.includes('encryption')) themes.push('security');
  if (lowerText.includes('api') || lowerText.includes('integration')) themes.push('integration');
  if (lowerText.includes('support') || lowerText.includes('help')) themes.push('support');
  
  if (themes.length === 0) themes.push('general');
  
  return {
    sentiment,
    urgency,
    business_impact,
    themes,
    confidence: Math.random() * 0.2 + 0.8 // High confidence for demo
  };
}

// Create demo progress states
export function createProgressState(phase: string, progress: number): {
  phase: string;
  progress: number;
  message: string;
} {
  const messages: Record<string, string> = {
    'uploading': 'Processing your feedback data...',
    'analyzing': 'Running AI analysis on feedback...',
    'clustering': 'Discovering patterns and themes...',
    'indexing': 'Building search index...',
    'complete': 'Analysis complete!'
  };
  
  return {
    phase,
    progress: Math.min(100, Math.max(0, progress)),
    message: messages[phase] || 'Processing...'
  };
}
