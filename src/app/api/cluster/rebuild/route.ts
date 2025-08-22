import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/guards';
import { rebuildClusters } from '@/lib/clustering';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { k } = await request.json();
    const clusterCount = k || 5;

    // Validate k parameter
    if (clusterCount < 2 || clusterCount > 20) {
      return NextResponse.json(
        { error: 'Cluster count must be between 2 and 20' },
        { status: 400 }
      );
    }

    // Rebuild clusters
    const clusters = await rebuildClusters(user.id, clusterCount);

    return NextResponse.json({
      message: 'Clusters rebuilt successfully',
      clusters,
      total_clusters: clusters.length,
    });
  } catch (error) {
    console.error('Cluster rebuild API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 