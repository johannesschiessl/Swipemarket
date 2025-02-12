export interface Profile {
  id: string;
  user_id: string;
  image_url: string | null;
  name: string;
  username: string;
  bio: string;
  created_at: string;
}

export interface ProfileSettings {
  image: string | null;
  name: string;
  username: string;
  bio: string;
}
