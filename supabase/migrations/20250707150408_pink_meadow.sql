/*
  # Add Article Tags System

  1. New Tables
    - `tags` - Store available tags
    - `article_tags` - Many-to-many relationship between articles and tags
  
  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for article_tags
CREATE POLICY "Anyone can view article tags"
  ON article_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage article tags"
  ON article_tags
  FOR ALL
  TO authenticated
  USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert some default tags
INSERT INTO tags (name, slug, description, color) VALUES
  ('Breaking News', 'breaking-news', 'Urgent and important news stories', '#DC2626'),
  ('Politics', 'politics', 'Political news and government affairs', '#1D4ED8'),
  ('Sports', 'sports', 'Sports news and events', '#059669'),
  ('Technology', 'technology', 'Technology and innovation news', '#7C3AED'),
  ('Business', 'business', 'Business and economic news', '#EA580C'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news', '#DB2777'),
  ('Health', 'health', 'Health and medical news', '#10B981'),
  ('Education', 'education', 'Education sector news', '#3B82F6'),
  ('Environment', 'environment', 'Environmental and climate news', '#22C55E'),
  ('International', 'international', 'International news and affairs', '#6366F1')
ON CONFLICT (slug) DO NOTHING;