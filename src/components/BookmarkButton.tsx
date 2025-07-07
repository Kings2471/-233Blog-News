import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

interface BookmarkButtonProps {
  articleId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  articleId, 
  size = 'md', 
  variant = 'outline',
  showText = false 
}) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { toast } = useToast();
  const bookmarked = isBookmarked(articleId);

  const handleToggleBookmark = async () => {
    if (bookmarked) {
      const success = await removeBookmark(articleId);
      if (success) {
        toast({
          title: "Bookmark removed",
          description: "Article removed from your bookmarks",
        });
      }
    } else {
      const success = await addBookmark(articleId);
      if (success) {
        toast({
          title: "Article bookmarked",
          description: "Article saved to your bookmarks",
        });
      } else {
        toast({
          title: "Login required",
          description: "Please log in to bookmark articles",
          variant: "destructive",
        });
      }
    }
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      className={`${bookmarked ? 'text-yellow-600 hover:text-yellow-700' : ''}`}
    >
      {bookmarked ? (
        <BookmarkCheck className={iconSizes[size]} />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
      {showText && (
        <span className="ml-2">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  );
};

export default BookmarkButton;