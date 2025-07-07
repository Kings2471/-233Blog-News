/*
  # Improve Analytics and Reporting

  1. New Views
    - Enhanced article analytics
    - Popular articles by time period
    - Category performance metrics
  
  2. Functions
    - Get trending articles
    - Get popular categories
*/

-- Create enhanced article analytics view
CREATE OR REPLACE VIEW article_analytics AS
SELECT 
  a.id,
  a.title,
  a.category,
  a.published,
  a.featured,
  a.publication_date,
  a.created_at,
  COALESCE(avc.total_views, 0) as total_views,
  COALESCE(avc.unique_user_views, 0) as unique_user_views,
  COALESCE(avc.unique_ip_views, 0) as unique_ip_views,
  COALESCE(comment_count.count, 0) as comment_count,
  COALESCE(bookmark_count.count, 0) as bookmark_count
FROM articles a
LEFT JOIN article_view_counts avc ON a.id = avc.article_id
LEFT JOIN (
  SELECT article_id, COUNT(*) as count
  FROM comments
  WHERE approved = true
  GROUP BY article_id
) comment_count ON a.id = comment_count.article_id
LEFT JOIN (
  SELECT article_id, COUNT(*) as count
  FROM bookmarks
  GROUP BY article_id
) bookmark_count ON a.id = bookmark_count.article_id;

-- Create category performance view
CREATE OR REPLACE VIEW category_performance AS
SELECT 
  category,
  COUNT(*) as article_count,
  COUNT(CASE WHEN published = true THEN 1 END) as published_count,
  COUNT(CASE WHEN featured = true THEN 1 END) as featured_count,
  COALESCE(SUM(total_views), 0) as total_views,
  COALESCE(AVG(total_views), 0) as avg_views_per_article,
  MAX(publication_date) as latest_article_date
FROM article_analytics
GROUP BY category
ORDER BY total_views DESC;

-- Function to get trending articles by time period
CREATE OR REPLACE FUNCTION get_trending_articles(
  time_period interval DEFAULT '7 days',
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  total_views bigint,
  publication_date timestamptz,
  trend_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.category,
    COALESCE(avc.total_views, 0) as total_views,
    a.publication_date,
    -- Calculate trend score based on views and recency
    CASE 
      WHEN COALESCE(avc.total_views, 0) = 0 THEN 0
      ELSE (
        COALESCE(avc.total_views, 0)::numeric * 
        (1 + (1 - EXTRACT(EPOCH FROM (now() - a.publication_date)) / EXTRACT(EPOCH FROM time_period)))
      )
    END as trend_score
  FROM articles a
  LEFT JOIN article_view_counts avc ON a.id = avc.article_id
  WHERE 
    a.published = true 
    AND a.publication_date >= (now() - time_period)
    AND a.publication_date <= now()
  ORDER BY trend_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular categories
CREATE OR REPLACE FUNCTION get_popular_categories(limit_count integer DEFAULT 5)
RETURNS TABLE (
  category text,
  article_count bigint,
  total_views bigint,
  avg_views numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.category,
    cp.published_count as article_count,
    cp.total_views,
    cp.avg_views_per_article as avg_views
  FROM category_performance cp
  WHERE cp.published_count > 0
  ORDER BY cp.total_views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;