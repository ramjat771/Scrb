export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed";

export interface ScheduledPost {
  id: string;

  content: string;

  image?: string;

  media_url?: string;

  url?: string;

  description?: string;

  hashtags?: string[];

  character_count?: number;

  user_id?: string;

  scheduled_at: string;

  created_at: string;

  updated_at: string;

  status: PostStatus;
}

export interface NewPost {
  content: string;

  image?: string;

  media_url?: string;

  url?: string;

  description?: string;

  hashtags?: string[];

  scheduled_at: string;
}