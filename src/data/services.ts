// This file is now deprecated - services are fetched dynamically from Supabase
// Use the useServices hook instead: import { useServices } from '../hooks/useServices';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  is_active: boolean;
}

// Legacy export for backward compatibility - will be removed in future versions
export const services: Service[] = [];
export const serviceCategories: string[] = [];