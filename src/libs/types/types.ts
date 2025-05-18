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

export interface HomeTypes {
  areas: AreaTypes[];
  property_listings: PropertyTypes[];
  agents: AgentTypes[];
}

export interface AgentTypes {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subscription: string;
  provider_id: string | null;
  email_verified_at: string | null;
  role: string;
}


export interface AreaTypes {
  id: number;
  image: string;
  count_of_properties: number;
  name: string;
}

export interface PropertyTypes {
  id: number;
  image: string;
  user: UserTypes;
  type: string;
  area: string;
  price: number;
  down_price: number;
  sqt: number;
  bathroom: number;
  bedroom: number;
  kitichen: number;
  status: string;
  apartment_office: string;
  immediate_delivery: string;
  title: string;
  description: string;
  keywords: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface UserTypes {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subscription: string;
  provider_id: string | null;
  email_verified_at: string | null;
  role: string;
}
