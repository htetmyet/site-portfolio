export type ServiceIconKey = 'brain' | 'analytics' | 'automation' | 'custom';

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
  logoUrl?: string | null;
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
  image: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
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
