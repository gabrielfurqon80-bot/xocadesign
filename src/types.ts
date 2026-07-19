export interface ThemeConfig {
  primaryColor: string; // Hex code or tailwind color name
  accentColor: string;  // Hex code or tailwind color name
  bgVariant: 'midnight' | 'obsidian' | 'charcoal' | 'nord'; // Background styles
  fontFamily: 'sans' | 'mono' | 'serif' | 'grotesk';
  borderStyle: 'sharp' | 'rounded' | 'pill';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  client?: string;
  year?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface AboutConfig {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  socials: {
    instagram?: string;
    dribbble?: string;
    behance?: string;
    email?: string;
    github?: string;
  };
}

export interface HeadlineConfig {
  greeting: string;
  title: string;
  subtitle: string;
  badgeText: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface CategoryConfig {
  name: string;
  maxUploads?: number; // Maximum posters in this category (optional/undefined means unlimited)
}

export interface PortfolioData {
  headline: HeadlineConfig;
  about: AboutConfig;
  theme: ThemeConfig;
  items: PortfolioItem[];
  contactMessages: ContactMessage[];
  categories?: CategoryConfig[];
}
