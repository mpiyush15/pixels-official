export interface ResearchQuestionTemplate {
  id: string;
  category: 
    | 'business_goals' 
    | 'target_audience' 
    | 'competitor_analysis' 
    | 'brand_aesthetic' 
    | 'technical_scope' 
    | 'timeline_budget' 
    | 'custom';
  categoryLabel: string;
  question: string;
  placeholder: string;
  suggestedAnswers?: string[];
}

export const RESEARCH_CATEGORIES = [
  { id: 'business_goals', label: '1. Business Goals & Vision', icon: 'Target' },
  { id: 'target_audience', label: '2. Target Audience & Positioning', icon: 'Users' },
  { id: 'competitor_analysis', label: '3. Competitor Benchmarking', icon: 'TrendingUp' },
  { id: 'brand_aesthetic', label: '4. Brand & Aesthetics', icon: 'Palette' },
  { id: 'technical_scope', label: '5. Technical & Functional Scope', icon: 'Cpu' },
  { id: 'timeline_budget', label: '6. Timeline, Budget & Milestones', icon: 'Clock' },
  { id: 'custom', label: '7. Custom / Client-Specific', icon: 'Sparkles' },
] as const;

export const DEFAULT_RESEARCH_QUESTIONS: ResearchQuestionTemplate[] = [
  // 1. Business Goals
  {
    id: 'bg-1',
    category: 'business_goals',
    categoryLabel: 'Business Goals & Vision',
    question: 'What is the primary objective and business problem this project aims to solve?',
    placeholder: 'e.g., Automate manual lead acquisition, revamp outdated product branding, or build a scalable SaaS MVP.',
  },
  {
    id: 'bg-2',
    category: 'business_goals',
    categoryLabel: 'Business Goals & Vision',
    question: 'What are the key measurable KPIs defining success within 6 months post-launch?',
    placeholder: 'e.g., 3x increase in conversion rate, 5,000 monthly active users, or reducing support response time by 40%.',
  },
  {
    id: 'bg-3',
    category: 'business_goals',
    categoryLabel: 'Business Goals & Vision',
    question: 'What is the long-term roadmap or expansion vision for the platform over the next 1–3 years?',
    placeholder: 'e.g., Expanding to international multi-currency markets, enterprise mobile apps, AI-driven automation.',
  },

  // 2. Target Audience & Market Positioning
  {
    id: 'ta-1',
    category: 'target_audience',
    categoryLabel: 'Target Audience & Positioning',
    question: 'Who is the ideal customer persona (demographics, geography, decision-makers, buying behavior)?',
    placeholder: 'e.g., Tech-savvy founders aged 25-45, small-to-medium enterprise procurement managers in India/US.',
  },
  {
    id: 'ta-2',
    category: 'target_audience',
    categoryLabel: 'Target Audience & Positioning',
    question: 'What are the biggest pain points or frustrations customers currently experience with alternative solutions?',
    placeholder: 'e.g., Complex legacy software, slow customer service, lack of transparent pricing, poor mobile responsiveness.',
  },
  {
    id: 'ta-3',
    category: 'target_audience',
    categoryLabel: 'Target Audience & Positioning',
    question: 'What is your core Unique Value Proposition (UVP) that makes you stand out from the market?',
    placeholder: 'e.g., 10x faster execution speed, bespoke customized concierge service, 50% lower maintenance overhead.',
  },

  // 3. Competitor Benchmarking
  {
    id: 'cb-1',
    category: 'competitor_analysis',
    categoryLabel: 'Competitor Benchmarking',
    question: 'Who are your top 3 direct and indirect competitors in this market segment?',
    placeholder: 'e.g., Competitor A (direct market leader), Competitor B (niche boutique), Competitor C (low-cost alternative).',
  },
  {
    id: 'cb-2',
    category: 'competitor_analysis',
    categoryLabel: 'Competitor Benchmarking',
    question: 'What do these competitors execute well that we should match or surpass?',
    placeholder: 'e.g., Intuitive self-service onboarding, strong social proof & case study videos, high SEO search rankings.',
  },
  {
    id: 'cb-3',
    category: 'competitor_analysis',
    categoryLabel: 'Competitor Benchmarking',
    question: 'Where are competitors failing or leaving market opportunities open?',
    placeholder: 'e.g., Outdated UI, lack of localized payment gateways, slow customer support, confusing pricing tiers.',
  },

  // 4. Brand & Aesthetics
  {
    id: 'ba-1',
    category: 'brand_aesthetic',
    categoryLabel: 'Brand & Aesthetics',
    question: 'What visual aesthetics and tone align best with your brand identity?',
    placeholder: 'e.g., Minimalist & Sleek Dark Mode, Vibrant & Playful gradients, Classic Executive Luxury, Clean Fintech Blue.',
  },
  {
    id: 'ba-2',
    category: 'brand_aesthetic',
    categoryLabel: 'Brand & Aesthetics',
    question: 'Do you have existing brand assets, design systems, or benchmark websites you admire?',
    placeholder: 'e.g., We love the typography of Stripe, the micro-animations of Linear, and the layout structure of Apple.',
  },

  // 5. Technical & Functional Scope
  {
    id: 'ts-1',
    category: 'technical_scope',
    categoryLabel: 'Technical & Functional Scope',
    question: 'What are the mandatory core functional features required for MVP launch?',
    placeholder: 'e.g., User authentication, payment gateway, custom analytics dashboard, multi-tenant roles, automated invoices.',
  },
  {
    id: 'ts-2',
    category: 'technical_scope',
    categoryLabel: 'Technical & Functional Scope',
    question: 'What third-party tools, APIs, payment processors, or ERP systems must be integrated?',
    placeholder: 'e.g., Cashfree / Stripe payments, ZeptoMail / SendGrid, AWS S3 file storage, Google Analytics 4.',
  },
  {
    id: 'ts-3',
    category: 'technical_scope',
    categoryLabel: 'Technical & Functional Scope',
    question: 'Are there specific hosting, database, scalability, or data compliance requirements?',
    placeholder: 'e.g., AWS VPS or Vercel deployment, MongoDB / PostgreSQL, GDPR compliance, SSL / SOC2 readiness.',
  },

  // 6. Timeline, Budget & Milestones
  {
    id: 'tb-1',
    category: 'timeline_budget',
    categoryLabel: 'Timeline, Budget & Milestones',
    question: 'What is the target delivery timeline and are there hard deadlines (e.g., product launch, funding round)?',
    placeholder: 'e.g., MVP within 6-8 weeks, full public release by end of Q4.',
  },
  {
    id: 'tb-2',
    category: 'timeline_budget',
    categoryLabel: 'Timeline, Budget & Milestones',
    question: 'What is the total planned budget allocation and preferred milestone payment structure?',
    placeholder: 'e.g., Total ₹2,50,000 to ₹3,50,000 (30% Advance on Kickoff, 40% on Beta, 30% on Final Deployment).',
  },
  {
    id: 'tb-3',
    category: 'timeline_budget',
    categoryLabel: 'Timeline, Budget & Milestones',
    question: 'Who are the key decision-makers and what is the approval turnaround time for milestone deliverables?',
    placeholder: 'e.g., CEO and CTO sign off on weekly demo calls, 48-hour revision approval turnaround.',
  },
];
