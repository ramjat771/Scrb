/*
  # Create Scheduled Posts Table

  ## Summary
  Creates the core table for the X (Twitter) post scheduler dashboard.

  ## New Tables
  - `scheduled_posts`
    - `id` (uuid, primary key)
    - `content` (text) - The post text content
    - `scheduled_at` (timestamptz) - When the post should go live
    - `status` (text) - draft | scheduled | published | failed
    - `media_url` (text, nullable) - Optional image/media URL
    - `hashtags` (text[], nullable) - Array of hashtags
    - `character_count` (int) - Cached character count
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `user_id` (uuid, references auth.users)

  ## Security
  - RLS enabled
  - Authenticated users can only access their own posts
*/

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  media_url text,
  hashtags text[] DEFAULT '{}',
  character_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON scheduled_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON scheduled_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON scheduled_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS scheduled_posts_user_id_idx ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS scheduled_posts_scheduled_at_idx ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS scheduled_posts_status_idx ON scheduled_posts(status);
