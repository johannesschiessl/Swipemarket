export interface Review {
  id: string;
  user_id: string;
  review_for: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review: string;
  created_at: string;
}
