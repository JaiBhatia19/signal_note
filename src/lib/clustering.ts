import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export interface Cluster {
  id: number;
  owner_id: string;
  label: string;
  size: number;
  centroid: number[];
  avg_sentiment: number;
  avg_urgency: number;
  feature_request: string;
  action_items: string;
  created_at: string;
}

export interface FeedbackItem {
  id: number;
  text: string;
  embedding: number[];
  sentiment: number;
  urgency: number;
  business_impact: number;
  source: string | null;
  user_segment: string | null;
  product_area: string | null;
}

// Simple k-means clustering implementation
export class KMeansClusterer {
  private k: number;
  private maxIterations: number;
  private tolerance: number;

  constructor(k: number = 5, maxIterations: number = 100, tolerance: number = 0.001) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
  }

  // Calculate Euclidean distance between two vectors
  private distance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Initialize centroids randomly
  private initializeCentroids(data: number[][]): number[][] {
    const centroids: number[][] = [];
    const dataLength = data.length;
    const vectorLength = data[0].length;

    for (let i = 0; i < this.k; i++) {
      const randomIndex = Math.floor(Math.random() * dataLength);
      centroids.push([...data[randomIndex]]);
    }

    return centroids;
  }

  // Assign data points to nearest centroid
  private assignToClusters(data: number[][], centroids: number[][]): number[] {
    const assignments: number[] = [];

    for (const point of data) {
      let minDistance = Infinity;
      let bestCluster = 0;

      for (let i = 0; i < centroids.length; i++) {
        const distance = this.distance(point, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          bestCluster = i;
        }
      }

      assignments.push(bestCluster);
    }

    return assignments;
  }

  // Update centroids based on cluster assignments
  private updateCentroids(data: number[][], assignments: number[]): number[][] {
    const newCentroids: number[][] = [];
    const vectorLength = data[0].length;

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((_, index) => assignments[index] === i);
      
      if (clusterPoints.length === 0) {
        // If cluster is empty, keep the old centroid
        newCentroids.push(new Array(vectorLength).fill(0));
        continue;
      }

      const centroid = new Array(vectorLength).fill(0);
      for (const point of clusterPoints) {
        for (let j = 0; j < vectorLength; j++) {
          centroid[j] += point[j];
        }
      }

      for (let j = 0; j < vectorLength; j++) {
        centroid[j] /= clusterPoints.length;
      }

      newCentroids.push(centroid);
    }

    return newCentroids;
  }

  // Check if centroids have converged
  private hasConverged(oldCentroids: number[][], newCentroids: number[][]): boolean {
    for (let i = 0; i < oldCentroids.length; i++) {
      if (this.distance(oldCentroids[i], newCentroids[i]) > this.tolerance) {
        return false;
      }
    }
    return true;
  }

  // Run k-means clustering
  cluster(data: number[][]): { assignments: number[]; centroids: number[][] } {
    if (data.length === 0) {
      return { assignments: [], centroids: [] };
    }

    if (data.length < this.k) {
      this.k = data.length;
    }

    let centroids = this.initializeCentroids(data);
    let assignments: number[] = [];

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      assignments = this.assignToClusters(data, centroids);
      const newCentroids = this.updateCentroids(data, assignments);

      if (this.hasConverged(centroids, newCentroids)) {
        break;
      }

      centroids = newCentroids;
    }

    return { assignments, centroids };
  }
}

// Generate cluster labels based on content
function generateClusterLabel(feedbackItems: FeedbackItem[]): string {
  if (feedbackItems.length === 0) return 'General Feedback';

  // Count common words (excluding common stop words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  const wordCount: { [key: string]: number } = {};
  
  feedbackItems.forEach(item => {
    const words = item.text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Get top 3 most common words
  const topWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);

  return topWords.length > 0 ? topWords.join(' ') : 'General Feedback';
}

// Generate feature request from cluster
function generateFeatureRequest(feedbackItems: FeedbackItem[]): string {
  if (feedbackItems.length === 0) return 'No specific feature request identified';

  const avgSentiment = feedbackItems.reduce((sum, item) => sum + item.sentiment, 0) / feedbackItems.length;
  const avgUrgency = feedbackItems.reduce((sum, item) => sum + item.urgency, 0) / feedbackItems.length;

  if (avgSentiment < 0.4 && avgUrgency > 0.7) {
    return 'High priority bug fix or critical feature';
  } else if (avgSentiment < 0.6 && avgUrgency > 0.5) {
    return 'Medium priority improvement or enhancement';
  } else {
    return 'Low priority enhancement or nice-to-have feature';
  }
}

// Generate action items from cluster
function generateActionItems(feedbackItems: FeedbackItem[]): string {
  if (feedbackItems.length === 0) return 'No specific action items identified';

  const items = [];
  
  if (feedbackItems.some(item => item.sentiment < 0.4)) {
    items.push('Address negative feedback immediately');
  }
  
  if (feedbackItems.some(item => item.urgency > 0.7)) {
    items.push('Prioritize urgent issues in next sprint');
  }
  
  if (feedbackItems.length > 5) {
    items.push('Consider this a high-impact area for development');
  }

  return items.length > 0 ? items.join('; ') : 'Monitor feedback trends';
}

// Rebuild clusters for a user
export async function rebuildClusters(userId: string, k: number = 5): Promise<Cluster[]> {
  try {
    // Get all feedback with embeddings for the user
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select(`
        id,
        text,
        embedding,
        sentiment,
        urgency,
        business_impact,
        source,
        user_segment,
        product_area
      `)
      .eq('owner_id', userId)
      .not('embedding', 'is', null);

    if (error || !feedback || feedback.length === 0) {
      console.error('Error fetching feedback for clustering:', error);
      return [];
    }

    // Extract embeddings for clustering
    const embeddings = feedback.map(f => f.embedding);
    
    // Run k-means clustering
    const clusterer = new KMeansClusterer(k);
    const { assignments, centroids } = clusterer.cluster(embeddings);

    // Group feedback by cluster
    const clusters: { [key: number]: FeedbackItem[] } = {};
    assignments.forEach((clusterId, index) => {
      if (!clusters[clusterId]) {
        clusters[clusterId] = [];
      }
      clusters[clusterId].push(feedback[index]);
    });

    // Delete existing clusters
    await supabase
      .from('clusters')
      .delete()
      .eq('owner_id', userId);

    // Create new clusters
    const newClusters: Omit<Cluster, 'id' | 'created_at'>[] = [];
    
    for (let i = 0; i < centroids.length; i++) {
      const clusterFeedback = clusters[i] || [];
      
      if (clusterFeedback.length === 0) continue;

      const avgSentiment = clusterFeedback.reduce((sum, item) => sum + (item.sentiment || 0), 0) / clusterFeedback.length;
      const avgUrgency = clusterFeedback.reduce((sum, item) => sum + (item.urgency || 0), 0) / clusterFeedback.length;

      newClusters.push({
        owner_id: userId,
        label: generateClusterLabel(clusterFeedback),
        size: clusterFeedback.length,
        centroid: centroids[i],
        avg_sentiment: avgSentiment,
        avg_urgency: avgUrgency,
        feature_request: generateFeatureRequest(clusterFeedback),
        action_items: generateActionItems(clusterFeedback),
      });
    }

    // Insert new clusters
    const { data: insertedClusters, error: insertError } = await supabase
      .from('clusters')
      .insert(newClusters)
      .select();

    if (insertError) {
      console.error('Error inserting clusters:', insertError);
      return [];
    }

    return insertedClusters || [];
  } catch (error) {
    console.error('Error rebuilding clusters:', error);
    return [];
  }
}

// Get clusters for a user
export async function getUserClusters(userId: string): Promise<Cluster[]> {
  try {
    const { data: clusters, error } = await supabase
      .from('clusters')
      .select('*')
      .eq('owner_id', userId)
      .order('size', { ascending: false });

    if (error) {
      console.error('Error fetching clusters:', error);
      return [];
    }

    return clusters || [];
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return [];
  }
} 