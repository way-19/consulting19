export interface Country {
  id: number;
  name: string;
  slug: string;
  flag: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  tags: string[];
  insights: {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
  }[];
}

export const countries: Country[] = [
  {
    id: 1, // Note: Database uses UUID, this is for frontend display only
    name: 'Georgia',
    slug: 'georgia',
    flag: '🇬🇪',
    description: 'Strategic gateway between Europe and Asia with exceptional business opportunities',
    highlights: [
      'Easy company formation process',
      '0% tax on foreign-sourced income',
      'Free economic zones available'
    ],
    imageUrl: 'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'tr'],
    tags: ['Tax Friendly', 'EU Proximity', 'Gateway Location'],
    insights: [
      {
        id: 1,
        title: 'New Investment Opportunities in Georgia 2024',
        excerpt: 'Latest developments in Georgia\'s business landscape and emerging opportunities for international investors.',
        author: 'Nino Kvaratskhelia',
        date: '2024-01-15',
        category: 'Market Update',
        readTime: '5 min read'
      }
    ]
  },
  {
    id: 2,
    name: 'United States',
    slug: 'usa',
    flag: '🇺🇸',
    description: 'World\'s largest economy with unmatched market access and innovation ecosystem',
    highlights: [
      'Delaware LLC advantages',
      'Global market access',
      'Advanced banking systems'
    ],
    imageUrl: 'https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en'],
    tags: ['Market Access', 'Innovation Hub', 'Global Standard'],
    insights: []
  },
  {
    id: 3,
    name: 'Montenegro',
    slug: 'montenegro',
    flag: '🇲🇪',
    description: 'Emerging European market with EU candidacy and investment incentives',
    highlights: [
      'EU candidate status',
      'Investment citizenship program',
      'Growing digital economy'
    ],
    imageUrl: 'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'sr'],
    tags: ['EU Candidate', 'Investment', 'Digital Growth'],
    insights: []
  },
  {
    id: 4,
    name: 'Estonia',
    slug: 'estonia',
    flag: '🇪🇪',
    description: 'Digital innovation leader with e-Residency program and tech-forward governance',
    highlights: [
      'e-Residency program',
      'Digital nomad friendly',
      'Advanced tech infrastructure'
    ],
    imageUrl: 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'et'],
    tags: ['Digital Leader', 'e-Residency', 'Tech Hub'],
    insights: []
  },
  {
    id: 5,
    name: 'Portugal',
    slug: 'portugal',
    flag: '🇵🇹',
    description: 'Gateway to Europe with Golden Visa program and strategic Atlantic location',
    highlights: [
      'Golden Visa program',
      'EU membership benefits',
      'Strategic Atlantic position'
    ],
    imageUrl: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'pt',
    supportedLanguages: ['pt', 'en'],
    tags: ['Golden Visa', 'EU Access', 'Atlantic Gateway'],
    insights: []
  },
  {
    id: 6,
    name: 'Malta',
    slug: 'malta',
    flag: '🇲🇹',
    description: 'Mediterranean financial hub with EU membership and favorable tax regime',
    highlights: [
      'EU membership advantages',
      'Financial services hub',
      'Tax optimization opportunities'
    ],
    imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en'],
    tags: ['EU Member', 'Financial Hub', 'Tax Optimization'],
    insights: []
  },
  {
    id: 7,
    name: 'Panama',
    slug: 'panama',
    flag: '🇵🇦',
    description: 'Premier offshore jurisdiction with global financial connectivity',
    highlights: [
      'Offshore banking excellence',
      'Global financial hub',
      'Privacy protection laws'
    ],
    imageUrl: 'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'es',
    supportedLanguages: ['es', 'en'],
    tags: ['Offshore Hub', 'Privacy', 'Global Finance'],
    insights: []
  },
  {
    id: 8,
    name: 'UAE',
    slug: 'uae',
    flag: '🇦🇪',
    description: 'Middle East business hub with free zones and strategic location',
    highlights: [
      'Tax-free zones available',
      'Strategic Middle East location',
      'Modern business infrastructure'
    ],
    imageUrl: 'https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    tags: ['Tax Free', 'Middle East Hub', 'Modern Infrastructure'],
    insights: []
  },
  {
    id: 9,
    name: 'Switzerland',
    slug: 'switzerland',
    flag: '🇨🇭',
    description: 'Premium financial center with political stability and banking excellence',
    highlights: [
      'Political stability',
      'Banking excellence',
      'Premium financial services'
    ],
    imageUrl: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'de', 'fr'],
    tags: ['Political Stability', 'Banking Excellence', 'Premium Services'],
    insights: []
  },
  {
    id: 10,
    name: 'Spain',
    slug: 'spain',
    flag: '🇪🇸',
    description: 'European Union member with growing startup ecosystem and quality of life',
    highlights: [
      'EU membership benefits',
      'Growing startup ecosystem',
      'Excellent quality of life'
    ],
    imageUrl: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
    primaryLanguage: 'es',
    supportedLanguages: ['es', 'en'],
    tags: ['EU Member', 'Startup Ecosystem', 'Quality of Life'],
    insights: []
  }
];