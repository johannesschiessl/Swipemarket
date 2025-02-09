export interface Product {
  id: string;
  name: string;
  images: string[];
  description: string;
  price: number;
  category: string;
  condition: string;
  is_sold: boolean;
  user_id: string;
  created_at: string;
}
