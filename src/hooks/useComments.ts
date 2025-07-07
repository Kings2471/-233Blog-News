import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export const useComments = (articleId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('approved', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        setError(error.message);
        return;
      }

      // Organize comments into a tree structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comment objects
      data?.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      data?.forEach(comment => {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentObj);
          }
        } else {
          rootComments.push(commentObj);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (commentData: {
    author_name: string;
    author_email: string;
    content: string;
    parent_id?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          ...commentData
        });

      if (error) {
        console.error('Error submitting comment:', error);
        setError(error.message);
        return false;
      }

      // Don't refetch immediately since comment needs approval
      return true;
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment');
      return false;
    }
  };

  return {
    comments,
    loading,
    error,
    submitComment,
    refetch: fetchComments
  };
};

export const useCommentModeration = () => {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending comments:', error);
        setError(error.message);
        return;
      }

      setPendingComments(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch pending comments');
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', commentId);

      if (error) {
        console.error('Error approving comment:', error);
        return false;
      }

      await fetchPendingComments();
      return true;
    } catch (err) {
      console.error('Error approving comment:', err);
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        return false;
      }

      await fetchPendingComments();
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      return false;
    }
  };

  return {
    pendingComments,
    loading,
    error,
    fetchPendingComments,
    approveComment,
    deleteComment
  };
};