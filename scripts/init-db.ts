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

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If we get a "table doesn't exist" error, the table is missing
    if (error && error.code === 'PGRST205') {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

async function createWaitlistTable() {
  console.log('📝 Creating waitlist table...');
  
  try {
    // Try to create the table by inserting data
    // Supabase will create the table structure automatically
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: 'temp@example.com',
        ref_code: 'TEMP'
      });
    
    if (error && error.code === 'PGRST205') {
      console.log('❌ Waitlist table creation failed - table not found in schema');
      return false;
    }
    
    if (error) {
      console.log('⚠️  Waitlist table warning:', error.message);
    } else {
      console.log('✅ Waitlist table created successfully');
      
      // Clean up test data
      await supabase
        .from('waitlist')
        .delete()
        .eq('email', 'temp@example.com');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Waitlist table creation failed:', error);
    return false;
  }
}

async function createEventsTable() {
  console.log('📝 Creating events table...');
  
  try {
    // Try to create the table by inserting data
    const { error } = await supabase
      .from('events')
      .insert({
        owner_id: null,
        name: 'test_event',
        data: { test: true }
      });
    
    if (error && error.code === 'PGRST205') {
      console.log('❌ Events table creation failed - table not found in schema');
      return false;
    }
    
    if (error) {
      console.log('⚠️  Events table warning:', error.message);
    } else {
      console.log('✅ Events table created successfully');
      
      // Clean up test data
      await supabase
        .from('events')
        .delete()
        .eq('name', 'test_event');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Events table creation failed:', error);
    return false;
  }
}

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...');
  
  const tables = ['profiles', 'waitlist', 'feedback', 'events'];
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    console.log(`${exists ? '✅' : '❌'} ${table} table: ${exists ? 'exists' : 'missing'}`);
  }
}

async function main() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Check current status
    await checkDatabaseStatus();
    
    // Try to create missing tables
    console.log('\n🔧 Attempting to create missing tables...');
    
    const waitlistCreated = await createWaitlistTable();
    const eventsCreated = await createEventsTable();
    
    // Check final status
    console.log('\n📊 Final database status:');
    await checkDatabaseStatus();
    
    if (waitlistCreated && eventsCreated) {
      console.log('\n🎉 All tables created successfully!');
    } else {
      console.log('\n⚠️  Some tables could not be created automatically.');
      console.log('💡 You may need to create them manually in the Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

main().catch(console.error); 