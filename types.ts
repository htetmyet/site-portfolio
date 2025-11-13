export type ServiceIconKey = 'brain' | 'analytics' | 'automation' | 'custom' | 'cloud' | 'shield' | 'spark' | 'vision';

export interface Service {
  id?: number;
  title: string;
  description: string;
  color?: string;
  iconKey?: ServiceIconKey;
  displayOrder?: number | null;
}

export interface HeroSlide {
  id?: number;
  supertitle?: string | null;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  order?: number | null;
}

export interface SiteSettings {
  companyName: string;
  tagline?: string | null;
  heroHeadline: string;
  heroSubheadline?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  contactAddress?: string | null;
  blogPreviewLimit?: number | null;
  productPreviewLimit?: number | null;
  projectPreviewLimit?: number | null;
  logoUrl?: string | null;
  backgroundPattern?: string | null;
}

export interface Product {
  id?: number;
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  images: string[];
  displayOrder?: number | null;
  pageContent?: string | null;
}

export interface Project {
  id?: number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  imageUrl?: string | null;
  displayOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

export interface GeneratedIdea {
  name: string;
  summary: string;
  technology: string;
}

export interface Post {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  category?: string | null;
  tags: string[];
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteContent {
  settings: SiteSettings;
  heroSlides: HeroSlide[];
  services: Service[];
  projects: Project[];
  products: Product[];
  posts: Post[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiNewsItem {
  id: string;
  title: string;
  source: string;
  url?: string | null;
  publishedAt?: string | null;
  snippet: string;
  content: string;
}

export interface AiRewriteResult {
  title: string;
  summary: string;
  markdown: string;
}

export interface AiModel {
  name: string;
  size?: number;
  digest?: string;
  modifiedAt?: string | null;
}
