export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}
