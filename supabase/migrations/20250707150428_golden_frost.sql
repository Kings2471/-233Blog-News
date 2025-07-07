/*
  # Add Full-Text Search for Articles

  1. Search Features
    - Add full-text search indexes
    - Create search function
  
  2. Performance
    - Add GIN indexes for better search performance
*/

-- Add full-text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_search_title 
  ON articles USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_articles_search_content 
  ON articles USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_articles_search_excerpt 
  ON articles USING gin(to_tsvector('english', coalesce(excerpt, '')));

-- Create a combined search index
CREATE INDEX IF NOT EXISTS idx_articles_search_combined 
  ON articles USING gin(
    to_tsvector('english', title || ' ' || content || ' ' || coalesce(excerpt, ''))
  );

-- Create search function
CREATE OR REPLACE FUNCTION search_articles(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  excerpt text,
  content text,
  category text,
  image_url text,
  slug text,
  created_at timestamptz,
  publication_date timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.excerpt,
    a.content,
    a.category,
    a.image_url,
    a.slug,
    a.created_at,
    a.publication_date,
    ts_rank(
      to_tsvector('english', a.title || ' ' || a.content || ' ' || coalesce(a.excerpt, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM articles a
  WHERE 
    a.published = true 
    AND a.publication_date <= now()
    AND to_tsvector('english', a.title || ' ' || a.content || ' ' || coalesce(a.excerpt, '')) 
        @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, a.publication_date DESC;
END;
$$ LANGUAGE plpgsql;