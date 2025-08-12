import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', url ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅' : '❌');
  console.error('\nPlease check your .env file');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { 
  auth: { 
    autoRefreshToken: false, 
    persistSession: false 
  }
});

async function main() {
  console.log('🚀 Starting production setup...\n');

  try {
    // Check if users already exist
    const { data: existingUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 }); // Fetch more users
    const emails = ['admin@consulting19.com', 'georgia@consulting19.com', 'client.georgia@consulting19.com', 'support@consulting19.com'];
    
    const existingEmails = existingUsers.users.map(u => u.email).filter(Boolean);
    const missingUsers = emails.filter(email => !existingEmails.includes(email));

    if (missingUsers.length === 0) {
      console.log('✅ All production users already exist!');
      console.log('\n🔐 You can login with:');
      console.log('   admin@consulting19.com / SecureAdmin2025! (Admin)');
      console.log('   georgia@consulting19.com / GeorgiaConsult2025! (Consultant)');
      console.log('   client.georgia@consulting19.com / ClientGeorgia2025! (Client)');
      console.log('   support@consulting19.com / Support2025! (Support)');
      return;
    }

    console.log(`⚠️  Missing users: ${missingUsers.join(', ')}`);
    console.log('💡 These users should be created by the SQL migration.');
    console.log('📋 Please run the complete_system_setup.sql migration in Supabase Dashboard first.');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});