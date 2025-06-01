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
  cover: string;
  user: UserTypes;
  type: {
    id: number;
    title: string;
    image: string | null;
    descriptions: {
      en: {
        title: string;
        image: string | null;
      };
      ar: {
        title: string;
        image: string | null;
      };
    };
  };
  area: {
    id: number;
    image: string;
    count_of_properties: number;
    name: string;
    description: {
      en: {
        name: string;
      };
      ar: {
        name: string;
      };
    };
  };
  price: number;
  down_price: number;
  sqt: number;
  bathroom: number;
  bedroom: number;
  kitichen: number;
  status: string;
  data_delay_time: string;
  immediate_delivery: string;
  title: string;
  description: string;
  keywords: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  descriptions: {
    en: {
      title: string;
      description: string;
      keywords: string;
      slug: string;
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
    };
    ar: {
      title: string;
      description: string;
      keywords: string;
      slug: string;
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
    };
  };
  features: {
    id: number;
    property_listing_id: number;
    type: string;
  }[];
  amenities: {
    id: number;
    property_listing_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }[];
  property_floor_plans: {
    id: number;
    image: string;
    property_listing_id: number;
  }[];
  property_listing_images: {
    id: number;
    image: string;
    property_listing_id: number;
  }[];
  property_locations: any[];
  property_price_trackings: PropertyPriceTrackings[];
}

export interface PropertyPriceTrackings {
  id: number;
  property_listing_id: number;
  price: number;
  created_at: string;
  updated_at: string;
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
