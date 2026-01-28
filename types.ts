
// Fix: Added exports to make this file a module and define shared interfaces used across the app
export type UserRole = 'admin' | 'member' | 'owner' | 'developer';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_id: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Project {
  project_id: string;
  name: string;
  ref_id: string;
  status: 'active' | 'paused' | 'archived';
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  company_id: string;
  name: string;
  slug: string;
}
