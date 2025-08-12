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
    console.log('🔧 Creating missing users...\n');

    // Create missing users
    const users = [
      { email: 'admin@consulting19.com', password: 'SecureAdmin2025!', role: 'admin' },
      { email: 'georgia@consulting19.com', password: 'GeorgiaConsult2025!', role: 'consultant' },
      { email: 'client.georgia@consulting19.com', password: 'ClientGeorgia2025!', role: 'client' },
      { email: 'support@consulting19.com', password: 'Support2025!', role: 'admin' }
    ];

    for (const userData of users) {
      if (missingUsers.includes(userData.email)) {
        console.log(`📝 Creating user: ${userData.email}`);
        
        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Failed to create ${userData.email}:`, authError.message);
          continue;
        }

        console.log(`✅ Created auth user: ${userData.email}`);

        // Create profile
        const { error: profileError } = await admin
          .from('profiles')
          .insert({
            id: authUser.user.id,
            auth_user_id: authUser.user.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.email.split('@')[0].replace('.', ' '),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Failed to create profile for ${userData.email}:`, profileError.message);
        } else {
          console.log(`✅ Created profile: ${userData.email} (${userData.role})`);
        }
      }
    }

    console.log('\n🎉 User creation completed!');
    console.log('\n🔐 You can now login with:');
    console.log('   admin@consulting19.com / SecureAdmin2025! (Admin)');
    console.log('   georgia@consulting19.com / GeorgiaConsult2025! (Consultant)');
    console.log('   client.georgia@consulting19.com / ClientGeorgia2025! (Client)');
    console.log('   support@consulting19.com / Support2025! (Support)');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});