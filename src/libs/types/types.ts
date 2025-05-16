export interface blogTypes {
  id: number;
  title: string;
  image: string;
  cover: string;
  description: string;
  keywords: string | null;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  created_at: string;
}

export interface blogFilterTypes {
  id: number;
  title: string;
  image: string;
}
