import { supabase } from '../lib/supabase';

export async function runAuthDiagnostic() {
  console.log('🔍 === AUTH DIAGNOSTIC START ===');
  
  try {
    // 1. Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📋 Current session:', session ? `User: ${session.user.email}` : 'No session');
    if (sessionError) console.error('❌ Session error:', sessionError);

    // 2. Check if user exists in auth.users (via admin)
    if (session?.user) {
      console.log('👤 Auth user ID:', session.user.id);
      console.log('📧 Auth user email:', session.user.email);
    }

    // 3. Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    console.log('👥 Profiles in database:', profiles?.length || 0);
    if (profilesError) console.error('❌ Profiles error:', profilesError);
    
    if (profiles && profiles.length > 0) {
      console.log('📊 Sample profiles:');
      profiles.forEach(p => {
        console.log(`  - ${p.email} (${p.role}) - auth_user_id: ${p.auth_user_id || 'NULL'}`);
      });
    }

    // 4. Try to find profile for current user
    if (session?.user) {
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      
      console.log('🔍 Profile by auth_user_id:', userProfile ? `Found: ${userProfile.email}` : 'Not found');
      if (userProfileError) console.error('❌ User profile error:', userProfileError);

      // Try by email as fallback
      const { data: emailProfile, error: emailProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();
      
      console.log('🔍 Profile by email:', emailProfile ? `Found: ${emailProfile.email}` : 'Not found');
      if (emailProfileError) console.error('❌ Email profile error:', emailProfileError);
    }

    // 5. Check RLS policies
    console.log('🛡️ Testing RLS policies...');
    const { data: testRLS, error: rlsError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (rlsError) {
      console.error('❌ RLS Error:', rlsError.message);
      console.log('💡 This might be a Row Level Security issue');
    } else {
      console.log('✅ RLS policies working');
    }

  } catch (error) {
    console.error('💥 Diagnostic failed:', error);
  }
  
  console.log('🔍 === AUTH DIAGNOSTIC END ===');
}

export async function clearAuthState() {
  console.log('🧹 Clearing auth state...');
  await supabase.auth.signOut();
  console.log('✅ Auth state cleared');
}