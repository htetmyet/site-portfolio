import type { HeroSlide, Post, Product, Service, SiteContent, SiteSettings } from '../types';

const defaultHeroSlides: HeroSlide[] = [
  {
    supertitle: 'AI-Powered Solutions',
    title: 'Innovate with Intelligence',
    subtitle: 'We build custom AI to solve your most complex business challenges.',
    imageUrl: 'https://picsum.photos/1920/1080?random=1',
    order: 0,
  },
  {
    supertitle: 'Your Digital Partner',
    title: 'Transforming Industries',
    subtitle: 'From automation to predictive analytics, we are your partners in growth.',
    imageUrl: 'https://picsum.photos/1920/1080?random=2',
    order: 1,
  },
  {
    supertitle: 'Future-Ready Technology',
    title: 'Building Tomorrow, Today',
    subtitle: 'Leverage cutting-edge AI to gain a competitive edge in your market.',
    imageUrl: 'https://picsum.photos/1920/1080?random=3',
    order: 2,
  },
];

const defaultServices: Service[] = [
  {
    title: 'Custom AI Development',
    description: 'We design and build bespoke AI models tailored to your specific data and business objectives for maximum impact.',
    color: 'green',
    iconKey: 'brain',
  },
  {
    title: 'Data Analytics & Insights',
    description: 'Unlock the potential of your data with our advanced analytics, providing actionable insights and predictive modeling.',
    color: 'blue',
    iconKey: 'analytics',
  },
  {
    title: 'AI-Powered Automation',
    description: 'Streamline your operations, reduce costs, and enhance efficiency by automating complex workflows and processes.',
    color: 'teal',
    iconKey: 'automation',
  },
];

const defaultProducts: Product[] = [
  {
    title: 'CognitoFlow',
    description: 'An AI-driven platform that automates complex business workflows, connecting disparate systems and making intelligent decisions.',
    longDescription:
      'CognitoFlow is a revolutionary enterprise-grade platform designed to bring hyper-automation to your fingertips. It seamlessly integrates with your existing software stack, using a sophisticated decision engine to analyze data in real-time, predict outcomes, and automate multi-step processes across departments like finance, HR, and operations. Reduce manual errors, accelerate process execution, and free up your human workforce for high-value strategic tasks.',
    pageContent:
      '<h2>Automation Engine</h2><p>CognitoFlow connects to your existing systems, monitoring data streams in real-time and triggering intelligent automations.</p><ul><li>Visual workflow designer</li><li>Human-in-the-loop approvals</li><li>Comprehensive analytics dashboard</li></ul>',
    features: [
      'Real-time process monitoring',
      'Predictive decision engine',
      'No-code workflow builder',
      'Multi-system integration API',
      'Automated reporting & analytics',
    ],
    images: [
      'https://picsum.photos/1200/800?random=10',
      'https://picsum.photos/1200/800?random=11',
      'https://picsum.photos/1200/800?random=12',
    ],
  },
  {
    title: 'InsightLens',
    description: 'A powerful data visualization tool that uses machine learning to uncover hidden patterns and trends in your business data.',
    longDescription:
      'Go beyond traditional dashboards with InsightLens. This next-generation business intelligence tool leverages unsupervised machine learning to sift through vast datasets and automatically surface critical insights, correlations, and anomalies that humans might miss. Its intuitive, natural language interface allows users of all technical levels to ask complex questions and receive clear, actionable visualizations in seconds.',
    pageContent:
      '<h2>InsightLens Experience</h2><p>Transform raw data into compelling narratives. InsightLens blends automated ML with natural language querying so every teammate can extract meaning.</p><blockquote>“InsightLens helped us surface hidden revenue opportunities within a week.”</blockquote>',
    features: [
      'Automated insight discovery',
      'Natural Language Querying (NLQ)',
      'Interactive data visualizations',
      'Trend & anomaly detection',
      'Customizable dashboards',
    ],
    images: [
      'https://picsum.photos/1200/800?random=13',
      'https://picsum.photos/1200/800?random=14',
      'https://picsum.photos/1200/800?random=15',
    ],
  },
];

const defaultPosts: Post[] = [
  {
    title: 'The Future of Generative AI in Enterprise',
    excerpt: 'Exploring how large language models are reshaping business intelligence and customer interactions.',
    content:
      'Exploring how large language models are reshaping business intelligence and customer interactions.',
    category: 'Industry Trends',
    tags: ['Generative AI', 'Enterprise', 'Innovation'],
    imageUrl: 'https://picsum.photos/800/600?random=7',
    publishedAt: '2023-10-26',
  },
  {
    title: '5 Steps to a Successful AI Implementation',
    excerpt: 'A practical guide for business leaders on navigating the complexities of integrating AI into their operations.',
    content:
      'A practical guide for business leaders on navigating the complexities of integrating AI into their operations.',
    category: 'Guides',
    tags: ['Strategy', 'AI Implementation', 'Best Practices'],
    imageUrl: 'https://picsum.photos/800/600?random=8',
    publishedAt: '2023-10-15',
  },
  {
    title: 'Ethical Considerations in AI Development',
    excerpt: 'A deep dive into the importance of building fair, transparent, and accountable AI systems.',
    content:
      'A deep dive into the importance of building fair, transparent, and accountable AI systems.',
    category: 'Thought Leadership',
    tags: ['AI Ethics', 'Responsibility', 'Technology'],
    imageUrl: 'https://picsum.photos/800/600?random=9',
    publishedAt: '2023-09-30',
  },
];

const defaultSettings: SiteSettings = {
  companyName: 'QuantumLeap AI',
  tagline: 'Building the future of intelligence, one solution at a time.',
  heroHeadline: 'Innovate with Intelligence',
  heroSubheadline: 'We build custom AI to solve your most complex business challenges.',
  contactEmail: 'hello@example.com',
  contactPhone: '+1 (555) 123-4567',
  contactAddress: '123 Innovation Way, Tech City',
  blogPreviewLimit: 3,
  productPreviewLimit: 2,
  logoUrl: null,
  backgroundPattern: 'mesh',
};

export const defaultContent: SiteContent = {
  settings: defaultSettings,
  heroSlides: defaultHeroSlides,
  services: defaultServices,
  products: defaultProducts,
  posts: defaultPosts,
};
