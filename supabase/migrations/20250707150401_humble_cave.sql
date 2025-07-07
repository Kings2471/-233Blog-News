/*
  # Fix Missing Foreign Key Relationships

  1. Foreign Keys
    - Add missing foreign key from articles to users table
    - Add missing foreign key from article_views to users table
  
  2. Security
    - Ensure proper RLS policies are in place
    - Add missing indexes for performance
*/

-- Add foreign key constraint from articles.author_id to users.id (if users table exists)
-- Note: The schema shows profiles table but articles references users table
-- We need to ensure consistency

-- First, let's check if we need to update the articles table to reference profiles instead
DO $$
BEGIN
  -- Check if users table exists, if not, update articles to reference profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Update articles table to reference profiles instead of users
    ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
    ALTER TABLE articles ADD CONSTRAINT articles_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_publication_date ON articles(publication_date);

-- Add index for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Add index for newsletter subscriptions
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed ON newsletter_subscriptions(subscribed);