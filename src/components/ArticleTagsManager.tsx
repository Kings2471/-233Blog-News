import React, { useState } from 'react';
import { useArticleTags } from '../hooks/useArticleTags';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { X, Plus, Tag } from 'lucide-react';

interface ArticleTagsManagerProps {
  articleId: string;
}

const ArticleTagsManager: React.FC<ArticleTagsManagerProps> = ({ articleId }) => {
  const { 
    tags, 
    articleTags, 
    loading, 
    addTagToArticle, 
    removeTagFromArticle, 
    createTag 
  } = useArticleTags(articleId);
  
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleAddTag = async (tagId: string) => {
    await addTagToArticle(articleId, tagId);
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromArticle(articleId, tagId);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newTag = await createTag({
      name: newTagName.trim(),
      slug,
      description: `Custom tag: ${newTagName}`,
      color: '#6B7280'
    });

    if (newTag) {
      await addTagToArticle(articleId, newTag.id);
      setNewTagName('');
    }
    setIsCreatingTag(false);
  };

  const availableTags = tags.filter(tag => 
    !articleTags.some(articleTag => articleTag.tag_id === tag.id)
  );

  const assignedTagIds = new Set(articleTags.map(at => at.tag_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Article Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assigned Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Tags</h4>
          <div className="flex flex-wrap gap-2">
            {articleTags.map((articleTag) => (
              <Badge 
                key={articleTag.id} 
                variant="default" 
                className="flex items-center gap-1"
                style={{ backgroundColor: articleTag.tag.color }}
              >
                {articleTag.tag.name}
                <button
                  onClick={() => handleRemoveTag(articleTag.tag_id)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {articleTags.length === 0 && (
              <p className="text-sm text-gray-500">No tags assigned</p>
            )}
          </div>
        </div>

        {/* Available Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available Tags</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {availableTags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleAddTag(tag.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Create New Tag */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Create New Tag</h4>
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="flex-1"
            />
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isCreatingTag}
              size="sm"
            >
              {isCreatingTag ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleTagsManager;