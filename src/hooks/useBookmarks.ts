import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    image_url: string;
    slug: string;
    publication_date: string;
  };
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarksIfAuthenticated();
  }, []);

  const fetchBookmarksIfAuthenticated = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchBookmarks();
    }
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          article:articles(
            id,
            title,
            excerpt,
            category,
            image_url,
            slug,
            publication_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
        setError(error.message);
        return;
      }

      setBookmarks(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (articleId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('You must be logged in to bookmark articles');
        return false;
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert({ article_id: articleId });

      if (error) {
        console.error('Error adding bookmark:', error);
        setError(error.message);
        return false;
      }

      await fetchBookmarks();
      return true;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('Failed to add bookmark');
      return false;
    }
  };

  const removeBookmark = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('article_id', articleId);

      if (error) {
        console.error('Error removing bookmark:', error);
        setError(error.message);
        return false;
      }

      await fetchBookmarks();
      return true;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark');
      return false;
    }
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.some(bookmark => bookmark.article_id === articleId);
  };

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refetch: fetchBookmarks
  };
};