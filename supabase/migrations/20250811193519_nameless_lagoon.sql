/*
  # Create database indexes for performance

  1. Indexes
    - Profile indexes for faster lookups
    - Client indexes for consultant assignments
    - Task indexes for status and due date queries
    - Document indexes for client and status queries

  2. Performance Benefits
    - Faster user authentication and profile lookups
    - Efficient consultant-client relationship queries
    - Quick task filtering and sorting
    - Fast document retrieval and status updates
*/

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_consultant_id ON public.clients(assigned_consultant_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_priority ON public.clients(priority);
CREATE INDEX IF NOT EXISTS idx_clients_service_type ON public.clients(service_type);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_consultant_id ON public.tasks(consultant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_reviewed_by ON public.documents(reviewed_by);