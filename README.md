# Consulting19 - AI-Enhanced Global Business Consulting Platform

A revolutionary business consulting platform that combines artificial intelligence with human expertise to provide comprehensive international business formation and advisory services.

## Features

- 🤖 **AI Oracle** - World's first AI-enhanced business consulting
- 🌍 **Global Reach** - Services across 127+ countries
- 👥 **Expert Consultants** - Specialized consultants for each jurisdiction
- 📊 **Real-time Analytics** - Live platform performance metrics
- 🔐 **Secure Platform** - Enterprise-grade security with RLS

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Fill in your Supabase credentials in .env:
# - VITE_SUPABASE_URL (from Supabase Dashboard → Settings → API)
# - VITE_SUPABASE_ANON_KEY (from Supabase Dashboard → Settings → API)
```

### 2. Database Setup

Run the complete system setup in your Supabase Dashboard → SQL Editor:
```sql
```bash
# Run this single migration file:
supabase/migrations/complete_system_setup.sql
```

### 3. Verify Setup

```bash
# Install dependencies
npm install

# Check if users were created (optional)
npm run seed:auth # This will also create the production users if they don't exist
```


Production users are created automatically by the SQL migration:
- **admin@consulting19.com** / SecureAdmin2025! (Platform Administrator)
- **georgia@consulting19.com** / GeorgiaConsult2025! (Georgia Consultant)
- **client.georgia@consulting19.com** / ClientGeorgia2025! (Test Client)
- **support@consulting19.com** / Support2025! (Customer Support)

### 4. Start Application

```bash
npm run dev
```

Visit `http://localhost:5173` and login with any of the production accounts.

## Architecture

### Database Schema

- **profiles** - User profiles linked to auth.users with role-based access
- **countries** - Supported jurisdictions with language support
- **clients** - Client management and tracking
- **consultant_country_assignments** - Consultant-country relationships
- **tasks** - Task management for consultants
- **documents** - Document upload and approval workflow

### Security

- **Row Level Security (RLS)** - Database-level access control
- **Role-based Access** - Admin, Consultant, Client, Legal Reviewer roles
- **Auto-profile Creation** - Automatic profile creation via database triggers

### AI Integration

- **AI Oracle** - Intelligent jurisdiction matching
- **Legal Oversight** - AI recommendations verified by legal experts
- **24/7 Availability** - Instant responses with human backup

## Development

### Production Users

Users are created automatically by the SQL migration. No manual seeding required.

The complete system includes:
- **Auto-profile creation** - Database triggers create profiles automatically
- **Role assignments** - Users get proper roles (admin/consultant/client)
- **Country assignments** - Consultants are assigned to their specialization countries
- **Test data** - Sample client assigned to Georgia consultant

### Profile Management

The app automatically manages user profiles via:

1. **Database Trigger** - `ensure_profile()` creates profiles when auth users are created
2. **Auth Integration** - Profiles are linked via `auth_user_id` foreign key
3. **Role-based Access** - RLS policies enforce proper data access

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed:auth    # Check if users exist (optional)
```

## Deployment

1. **Database** - Run complete_system_setup.sql in Supabase Dashboard
2. **Environment** - Set production environment variables
3. **Build** - `npm run build` and deploy static files

## Security Notes

- 🛡️ All user data protected by Row Level Security
- ✅ Profile creation uses secure database triggers
- 🔐 Production users have secure passwords
- 👥 Complete role-based access control system

## Support

For technical support or questions about the platform, please contact our development team.

---

© 2025 Consulting19. All rights reserved.