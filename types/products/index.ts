export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  is_sold: boolean;
  created_at: string;
  profiles: {
    name: string;
    username: string;
    image_url: string | null;
  };
}
