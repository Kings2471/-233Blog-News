import React, { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { MessageCircle, Reply, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface CommentsSectionProps {
  articleId: string;
}

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ articleId, parentId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitComment } = useComments(articleId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await submitComment({
      ...formData,
      parent_id: parentId
    });

    if (success) {
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for review and will appear once approved.",
      });
      setFormData({ author_name: '', author_email: '', content: '' });
      onSubmit();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Your name"
          value={formData.author_name}
          onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
          required
        />
        <Input
          type="email"
          placeholder="Your email"
          value={formData.author_email}
          onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
          required
        />
      </div>
      <Textarea
        placeholder="Write your comment..."
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        required
        rows={4}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

const CommentItem: React.FC<{ comment: any; articleId: string; onReply: () => void }> = ({ 
  comment, 
  articleId, 
  onReply 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900">{comment.author_name}</div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {formatDate(comment.created_at)}
          </div>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
        >
          <Reply className="w-4 h-4 mr-1" />
          Reply
        </Button>
      </div>

      {showReplyForm && (
        <div className="ml-6 p-4 bg-blue-50 rounded-lg">
          <CommentForm
            articleId={articleId}
            parentId={comment.id}
            onSubmit={() => {
              setShowReplyForm(false);
              onReply();
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-4">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ articleId }) => {
  const { comments, loading, refetch } = useComments(articleId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <div>
          <h4 className="text-lg font-medium mb-4">Leave a Comment</h4>
          <CommentForm articleId={articleId} onSubmit={refetch} />
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                articleId={articleId}
                onReply={refetch}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;