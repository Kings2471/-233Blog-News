import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

interface ArticleTag {
  id: string;
  article_id: string;
  tag_id: string;
  created_at: string;
  tag: Tag;
}

export const useArticleTags = (articleId?: string) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [articleTags, setArticleTags] = useState<ArticleTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
    if (articleId) {
      fetchArticleTags(articleId);
    }
  }, [articleId]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching tags:', error);
        setError(error.message);
        return;
      }

      setTags(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch tags');
    }
  };

  const fetchArticleTags = async (articleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('article_tags')
        .select(`
          *,
          tag:tags(*)
        `)
        .eq('article_id', articleId);

      if (error) {
        console.error('Error fetching article tags:', error);
        setError(error.message);
        return;
      }

      setArticleTags(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch article tags');
    } finally {
      setLoading(false);
    }
  };

  const addTagToArticle = async (articleId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('article_tags')
        .insert({ article_id: articleId, tag_id: tagId });

      if (error) {
        console.error('Error adding tag to article:', error);
        return false;
      }

      await fetchArticleTags(articleId);
      return true;
    } catch (err) {
      console.error('Error adding tag:', err);
      return false;
    }
  };

  const removeTagFromArticle = async (articleId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId)
        .eq('tag_id', tagId);

      if (error) {
        console.error('Error removing tag from article:', error);
        return false;
      }

      await fetchArticleTags(articleId);
      return true;
    } catch (err) {
      console.error('Error removing tag:', err);
      return false;
    }
  };

  const createTag = async (tagData: { name: string; slug: string; description?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(tagData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tag:', error);
        return null;
      }

      await fetchTags();
      return data;
    } catch (err) {
      console.error('Error creating tag:', err);
      return null;
    }
  };

  return {
    tags,
    articleTags,
    loading,
    error,
    addTagToArticle,
    removeTagFromArticle,
    createTag,
    refetchTags: fetchTags,
    refetchArticleTags: fetchArticleTags
  };
};