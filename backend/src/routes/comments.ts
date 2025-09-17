import express from 'express';
import { ApiResponse, Comment, CreateCommentRequest } from '../types/index.js';

const router = express.Router();

// In-memory comments store
const comments: Comment[] = [
  {
    id: 'comment-1',
    photoId: 'photo-1',
    projectId: 'proj-1',
    authorId: 'user-2',
    authorName: 'Jane Client',
    content: 'This is such a beautiful shot! I love the lighting.',
    createdAt: new Date('2024-01-16T11:00:00')
  },
  {
    id: 'comment-2',
    photoId: 'photo-1',
    projectId: 'proj-1',
    authorId: 'user-1',
    authorName: 'John Photographer',
    content: 'Thank you! I was really happy with how this one turned out. The golden hour lighting was perfect.',
    parentId: 'comment-1',
    createdAt: new Date('2024-01-16T11:15:00')
  },
  {
    id: 'comment-3',
    photoId: 'photo-2',
    projectId: 'proj-1',
    authorId: 'user-2',
    authorName: 'Jane Client',
    content: 'Could we get a slightly tighter crop on this one?',
    createdAt: new Date('2024-01-16T11:30:00')
  }
];

// Simple auth helper (in real app, extract from middleware)
function getUserFromAuth(req: express.Request): { id: string, name: string } | null {
  // Mock user extraction - in real app, get from validated JWT
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  // Mock user data based on token
  if (token.includes('photographer')) {
    return { id: 'user-1', name: 'John Photographer' };
  } else {
    return { id: 'user-2', name: 'Jane Client' };
  }
}

// GET /api/comments/photo/:photoId - Get all comments for a photo
router.get('/photo/:photoId', (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Get all comments for this photo
    const photoComments = comments
      .filter(c => c.photoId === photoId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Organize comments into threads (parent comments with replies)
    const topLevelComments = photoComments.filter(c => !c.parentId);
    const threaded = topLevelComments.map(parent => ({
      ...parent,
      replies: photoComments
        .filter(c => c.parentId === parent.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }));

    res.json({
      success: true,
      data: {
        comments: threaded,
        total: photoComments.length
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/comments/photo/:photoId - Add comment to a photo
router.post('/photo/:photoId', (req, res) => {
  try {
    const { photoId } = req.params;
    const { content, parentId }: CreateCommentRequest = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      } as ApiResponse);
    }

    // Get user from auth
    const user = getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = comments.find(c => c.id === parentId && c.photoId === photoId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found'
        } as ApiResponse);
      }
      
      // Don't allow nested replies (only 1 level deep)
      if (parentComment.parentId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot reply to a reply. Please reply to the original comment.'
        } as ApiResponse);
      }
    }

    // Create new comment
    const newComment: Comment = {
      id: `comment-${comments.length + 1}`,
      photoId,
      projectId: 'proj-1', // In real app, get from photo/project relationship
      authorId: user.id,
      authorName: user.name,
      content: content.trim(),
      parentId: parentId || undefined,
      createdAt: new Date()
    };

    comments.push(newComment);

    res.status(201).json({
      success: true,
      data: newComment
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// PUT /api/comments/:commentId - Update a comment (only by author)
router.put('/:commentId', (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      } as ApiResponse);
    }

    const user = getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      } as ApiResponse);
    }

    const comment = comments[commentIndex];
    if (comment.authorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own comments'
      } as ApiResponse);
    }

    // Update comment
    comments[commentIndex] = {
      ...comment,
      content: content.trim(),
      // In real app, might add updatedAt field
    };

    res.json({
      success: true,
      data: comments[commentIndex]
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// DELETE /api/comments/:commentId - Delete a comment (only by author)
router.delete('/:commentId', (req, res) => {
  try {
    const { commentId } = req.params;

    const user = getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      } as ApiResponse);
    }

    const comment = comments[commentIndex];
    if (comment.authorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own comments'
      } as ApiResponse);
    }

    // Remove comment and any replies
    const toRemove = [commentId];
    const replies = comments.filter(c => c.parentId === commentId);
    toRemove.push(...replies.map(r => r.id));

    // Remove all comments and replies
    toRemove.forEach(id => {
      const index = comments.findIndex(c => c.id === id);
      if (index !== -1) {
        comments.splice(index, 1);
      }
    });

    res.json({
      success: true,
      message: `Comment deleted ${replies.length > 0 ? `(and ${replies.length} replies)` : ''}`
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// GET /api/comments/project/:projectId - Get all comments for a project
router.get('/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get all comments for this project
    const projectComments = comments
      .filter(c => c.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first

    // Group by photo
    const commentsByPhoto = projectComments.reduce((acc, comment) => {
      if (!acc[comment.photoId]) {
        acc[comment.photoId] = [];
      }
      acc[comment.photoId].push(comment);
      return acc;
    }, {} as Record<string, Comment[]>);

    res.json({
      success: true,
      data: {
        commentsByPhoto,
        total: projectComments.length,
        photosWithComments: Object.keys(commentsByPhoto).length
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
