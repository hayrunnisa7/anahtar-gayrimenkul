export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Yazının tam gövdesi, her öğe bir paragraf. */
  content: string[];
  author: string;
  publishedAt: string;
  readMinutes: number;
  category: string;
}
