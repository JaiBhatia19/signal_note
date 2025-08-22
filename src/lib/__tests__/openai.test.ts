import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFeedback, generateEmbedding, hashText } from '../openai';

// Mock environment variables
vi.mock('../env', () => ({
  env: {
    OPENAI_API_KEY: 'test-key',
    ANALYSIS_MODEL: 'gpt-4o-mini',
    EMBEDDINGS_MODEL: 'text-embedding-3-small',
  },
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: '{"sentiment": 0.8, "urgency": 0.3, "insights": ["Great feedback"], "business_impact": 4}'
            }
          }]
        })
      }
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{
          embedding: new Array(1536).fill(0.1)
        }]
      })
    }
  }))
}));

describe('OpenAI Utilities', () => {
  describe('hashText', () => {
    it('should generate consistent hashes for the same text', () => {
      const text1 = 'Hello world';
      const text2 = 'Hello world';
      
      expect(hashText(text1)).toBe(hashText(text2));
    });

    it('should generate different hashes for different text', () => {
      const text1 = 'Hello world';
      const text2 = 'Hello world!';
      
      expect(hashText(text1)).not.toBe(hashText(text2));
    });

    it('should handle empty string', () => {
      expect(hashText('')).toBeDefined();
    });
  });

  describe('analyzeFeedback', () => {
    it('should return valid analysis structure', async () => {
      const result = await analyzeFeedback('Great product!');
      
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('urgency');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('business_impact');
      expect(result.sentiment).toBeGreaterThanOrEqual(0);
      expect(result.sentiment).toBeLessThanOrEqual(1);
      expect(result.urgency).toBeGreaterThanOrEqual(0);
      expect(result.urgency).toBeLessThanOrEqual(1);
      expect(result.business_impact).toBeGreaterThanOrEqual(1);
      expect(result.business_impact).toBeLessThanOrEqual(5);
    });
  });

  describe('generateEmbedding', () => {
    it('should return array of numbers', async () => {
      const result = await generateEmbedding('Test text');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1536);
      expect(typeof result[0]).toBe('number');
    });
  });
}); 