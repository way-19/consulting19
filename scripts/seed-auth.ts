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
  console.log('🚀 Creating production users...\n');

  const users = [
    { 
      email: 'admin@consulting19.com', 
      password: 'SecureAdmin2025!', 
      role: 'admin',
      full_name: 'Platform Administrator'
    },
    { 
      email: 'georgia@consulting19.com', 
      password: 'GeorgiaConsult2025!', 
      role: 'consultant',
      full_name: 'Georgia Consultant',
      country: 'Georgia'
    },
    { 
      email: 'client.georgia@consulting19.com', 
      password: 'ClientGeorgia2025!', 
      role: 'client',
      full_name: 'Test Client',
      country: 'Georgia'
    },
    { 
      email: 'support@consulting19.com', 
      password: 'Support2025!', 
      role: 'admin',
      full_name: 'Customer Support'
    }
  ];

  for (const userData of users) {
    try {
      console.log(`📝 Creating user: ${userData.email}`);
      
      // Create auth user
      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✅ User already exists: ${userData.email}`);
          
          // Get existing user
          const { data: existingUsers } = await admin.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === userData.email);
          
          if (existingUser) {
            // Check if profile exists
            const { data: existingProfile } = await admin
              .from('profiles')
              .select('*')
              .eq('auth_user_id', existingUser.id)
              .single();

            if (!existingProfile) {
              console.log(`📝 Creating missing profile for: ${userData.email}`);
              
              const { error: profileError } = await admin
                .from('profiles')
                .insert({
                  id: existingUser.id,
                  auth_user_id: existingUser.id,
                  email: userData.email,
                  role: userData.role,
                  full_name: userData.full_name,
                  country: userData.country || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (profileError) {
                console.error(`❌ Failed to create profile for ${userData.email}:`, profileError.message);
              } else {
                console.log(`✅ Created profile: ${userData.email} (${userData.role})`);
              }
            } else {
              console.log(`✅ Profile already exists: ${userData.email} (${existingProfile.role})`);
            }
          }
          continue;
        } else {
          console.error(`❌ Failed to create ${userData.email}:`, authError.message);
          continue;
        }
      }

      if (authUser?.user) {
        console.log(`✅ Created auth user: ${userData.email}`);

        // Create profile
        const { error: profileError } = await admin
          .from('profiles')
          .insert({
            id: authUser.user.id,
            auth_user_id: authUser.user.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.full_name,
            country: userData.country || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Failed to create profile for ${userData.email}:`, profileError.message);
        } else {
          console.log(`✅ Created profile: ${userData.email} (${userData.role})`);
        }
      }
    } catch (error) {
      console.error(`💥 Error processing ${userData.email}:`, error);
    }
  }

  console.log('\n🎉 User creation process completed!');
  console.log('\n🔐 Login credentials:');
  console.log('   admin@consulting19.com / SecureAdmin2025! (Admin)');
  console.log('   georgia@consulting19.com / GeorgiaConsult2025! (Consultant)');
  console.log('   client.georgia@consulting19.com / ClientGeorgia2025! (Client)');
  console.log('   support@consulting19.com / Support2025! (Support)');
  
  // Create client record for the test client
  try {
    console.log('\n📋 Setting up client record...');
    
    const { data: clientProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', 'client.georgia@consulting19.com')
      .single();

    const { data: consultantProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', 'georgia@consulting19.com')
      .single();

    if (clientProfile && consultantProfile) {
      const { error: clientError } = await admin
        .from('clients')
        .insert({
          profile_id: clientProfile.id,
          assigned_consultant_id: consultantProfile.id,
          company_name: 'Georgia Tech Solutions LLC',
          status: 'in_progress',
          priority: 'medium',
          service_type: 'company_formation',
          progress: 45
        });

      if (clientError && !clientError.message.includes('duplicate')) {
        console.error('❌ Failed to create client record:', clientError.message);
      } else {
        console.log('✅ Client record created/exists');
      }
    }
  } catch (error) {
    console.log('⚠️ Client record setup skipped:', error);
  }
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});