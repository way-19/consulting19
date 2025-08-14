export interface Service {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  color: string;
  icon: string;
  popular?: boolean;
}

export const services: Service[] = [
  {
    id: 1,
    name: 'Company Formation',
    slug: 'company-formation',
    category: 'Business Setup',
    description: 'Complete company registration and setup in your chosen jurisdiction',
    features: [
      'Legal entity registration',
      'Corporate documentation',
      'Banking coordination',
      'Ongoing compliance support'
    ],
    color: 'bg-blue-500',
    icon: 'Building2',
    popular: true
  },
  {
    id: 2,
    name: 'Investment Advisory',
    slug: 'investment-advisory',
    category: 'Financial Services',
    description: 'Strategic investment guidance and portfolio optimization',
    features: [
      'Market analysis',
      'Risk assessment',
      'Portfolio diversification',
      'Tax optimization strategies'
    ],
    color: 'bg-green-500',
    icon: 'TrendingUp',
  },
  {
    id: 3,
    name: 'Legal Consulting',
    slug: 'legal-consulting',
    category: 'Legal Services',
    description: 'Expert legal advice for international business operations',
    features: [
      'Contract reviews',
      'Compliance guidance',
      'Legal structure optimization',
      'Dispute resolution support'
    ],
    color: 'bg-purple-500',
    icon: 'Scale',
  },
  {
    id: 4,
    name: 'Accounting Services',
    slug: 'accounting-services',
    category: 'Financial Services',
    description: 'Professional accounting and bookkeeping for international businesses',
    features: [
      'Monthly bookkeeping',
      'Tax preparation',
      'Financial reporting',
      'Multi-currency support'
    ],
    color: 'bg-orange-500',
    icon: 'Calculator',
  },
  {
    id: 5,
    name: 'Visa & Residency',
    slug: 'visa-residency',
    category: 'Immigration',
    description: 'Visa applications and residency programs for global mobility',
    features: [
      'Visa application support',
      'Residency program guidance',
      'Document preparation',
      'Application tracking'
    ],
    color: 'bg-teal-500',
    icon: 'Plane',
  },
  {
    id: 6,
    name: 'Market Research',
    slug: 'market-research',
    category: 'Business Intelligence',
    description: 'In-depth market analysis and business intelligence reports',
    features: [
      'Market opportunity analysis',
      'Competitor research',
      'Industry trend reports',
      'Entry strategy recommendations'
    ],
    color: 'bg-pink-500',
    icon: 'BarChart3',
  },
  {
    id: 7,
    name: 'Banking Solutions',
    slug: 'banking-solutions',
    category: 'Financial Services',
    description: 'International banking solutions and account setup assistance',
    features: [
      'Bank account opening',
      'Multi-currency accounts',
      'International transfers',
      'Banking relationship management'
    ],
    color: 'bg-indigo-500',
    icon: 'CreditCard',
  },
  {
    id: 8,
    name: 'Ongoing Compliance',
    slug: 'ongoing-compliance',
    category: 'Legal Services',
    description: 'Continuous compliance monitoring and regulatory support',
    features: [
      'Regulatory monitoring',
      'Annual filings',
      'Compliance audits',
      'Policy updates'
    ],
    color: 'bg-red-500',
    icon: 'Shield',
  }
];

export const serviceCategories = [
  'Business Setup',
  'Financial Services', 
  'Legal Services',
  'Immigration',
  'Business Intelligence'
];