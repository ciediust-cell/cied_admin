export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  newsDate: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}
