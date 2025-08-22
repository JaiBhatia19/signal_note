import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create sample user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'demo@signalnote.com',
      password: 'demo123456',
      email_confirm: true,
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    const userId = user.user.id;
    console.log('✅ Created demo user:', userId);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: 'Demo User',
        role: 'free',
        ref_code: 'DEMO123',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('✅ Created user profile');

    // Sample feedback data
    const sampleFeedback = [
      {
        owner_id: userId,
        text: 'The dashboard is too slow when loading large datasets. It takes over 10 seconds to display charts.',
        source: 'email',
        user_segment: 'enterprise',
        product_area: 'dashboard',
        sentiment: 0.3,
        urgency: 0.8,
        business_impact: 4,
        analysis: {
          insights: ['Performance issue with large datasets', 'Dashboard loading time exceeds user expectations', 'Charts rendering is slow'],
          summary: 'Critical performance issue affecting dashboard usability'
        }
      },
      {
        owner_id: userId,
        text: 'Love the new search feature! It finds exactly what I need in seconds.',
        source: 'in-app',
        user_segment: 'pro',
        product_area: 'search',
        sentiment: 0.9,
        urgency: 0.2,
        business_impact: 3,
        analysis: {
          insights: ['Search functionality exceeds expectations', 'Fast response time', 'High user satisfaction'],
          summary: 'Positive feedback on search feature performance'
        }
      },
      {
        owner_id: userId,
        text: 'The mobile app crashes when trying to upload files larger than 10MB.',
        source: 'support',
        user_segment: 'free',
        product_area: 'mobile',
        sentiment: 0.2,
        urgency: 0.9,
        business_impact: 5,
        analysis: {
          insights: ['Mobile app stability issue', 'File size limitation problem', 'Critical bug affecting core functionality'],
          summary: 'Critical mobile app crash issue with file uploads'
        }
      },
      {
        owner_id: userId,
        text: 'The reporting feature is great but I wish I could export to Excel format.',
        source: 'feedback_form',
        user_segment: 'enterprise',
        product_area: 'reporting',
        sentiment: 0.7,
        urgency: 0.4,
        business_impact: 3,
        analysis: {
          insights: ['Reporting feature well received', 'Export functionality requested', 'Excel format needed'],
          summary: 'Positive feedback with feature request for Excel export'
        }
      },
      {
        owner_id: userId,
        text: 'Can you add dark mode to the interface? The current theme is too bright for late night work.',
        source: 'twitter',
        user_segment: 'pro',
        product_area: 'ui',
        sentiment: 0.6,
        urgency: 0.3,
        business_impact: 2,
        analysis: {
          insights: ['Dark mode requested', 'Accessibility improvement needed', 'User preference for night work'],
          summary: 'Feature request for dark mode theme'
        }
      }
    ];

    // Insert sample feedback
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert(sampleFeedback);

    if (feedbackError) {
      console.error('Error inserting feedback:', feedbackError);
      return;
    }

    console.log('✅ Inserted sample feedback');

    // Create sample clusters
    const sampleClusters = [
      {
        owner_id: userId,
        label: 'Performance Issues',
        size: 2,
        centroid: [0.25, 0.85, 4.5], // avg sentiment, urgency, business_impact
        avg_sentiment: 0.25,
        avg_urgency: 0.85,
        feature_request: 'Optimize dashboard performance for large datasets and fix mobile app crashes',
        action_items: ['Profile database queries for dashboard', 'Implement file size validation in mobile app', 'Add performance monitoring']
      },
      {
        owner_id: userId,
        label: 'Feature Requests',
        size: 2,
        centroid: [0.65, 0.35, 2.5],
        avg_sentiment: 0.65,
        avg_urgency: 0.35,
        feature_request: 'Add dark mode theme and Excel export functionality',
        action_items: ['Design dark mode color scheme', 'Implement Excel export in reporting', 'Add theme toggle in settings']
      },
      {
        owner_id: userId,
        label: 'Positive Feedback',
        size: 1,
        centroid: [0.9, 0.2, 3.0],
        avg_sentiment: 0.9,
        avg_urgency: 0.2,
        feature_request: 'Continue improving search functionality',
        action_items: ['Monitor search performance metrics', 'Gather more user feedback on search', 'Consider advanced search features']
      }
    ];

    // Insert sample clusters
    const { error: clustersError } = await supabase
      .from('clusters')
      .insert(sampleClusters);

    if (clustersError) {
      console.error('Error inserting clusters:', clustersError);
      return;
    }

    console.log('✅ Created sample clusters');

    // Create sample events
    const sampleEvents = [
      {
        user_id: userId,
        event_type: 'feedback_submitted',
        metadata: { count: 5 }
      },
      {
        user_id: userId,
        event_type: 'clusters_rebuilt',
        metadata: { k: 3 }
      },
      {
        user_id: userId,
        event_type: 'search_performed',
        metadata: { query: 'dashboard' }
      }
    ];

    // Insert sample events
    const { error: eventsError } = await supabase
      .from('events')
      .insert(sampleEvents);

    if (eventsError) {
      console.error('Error inserting events:', eventsError);
      return;
    }

    console.log('✅ Created sample events');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Demo user: demo@signalnote.com');
    console.log('🔑 Password: demo123456');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
seed(); 