import express from 'express';
import { ApiResponse, Selection, UpdateSelectionRequest } from '../types/index.js';

const router = express.Router();

// Import data from projects (in real app, this would be shared or from DB)
const projects = [
  {
    id: 'proj-1',
    name: 'Wedding Photos - Smith Family',
    description: 'Beautiful outdoor wedding ceremony',
    photographerId: 'user-1',
    shareToken: 'share-wedding-smith-2024',
    status: 'shared',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

const folders = [
  {
    id: 'folder-1',
    projectId: 'proj-1',
    name: 'Ceremony',
    description: 'Wedding ceremony photos',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'folder-2',
    projectId: 'proj-1',
    name: 'Reception',
    description: 'Reception and party photos',
    createdAt: new Date('2024-01-15')
  }
];

const photos = [
  {
    id: 'photo-1',
    folderId: 'folder-1',
    projectId: 'proj-1',
    filename: 'DSC_0001.jpg',
    originalName: 'Wedding_Ceremony_001.jpg',
    url: 'https://picsum.photos/800/600?random=1',
    thumbnailUrl: 'https://picsum.photos/300/200?random=1',
    size: 2500000,
    width: 1920,
    height: 1080,
    metadata: {
      camera: 'Canon EOS R5',
      lens: '24-70mm f/2.8',
      iso: 400,
      aperture: 'f/2.8',
      shutterSpeed: '1/200',
      takenAt: new Date('2024-01-15T14:30:00')
    },
    uploadedAt: new Date('2024-01-15T20:00:00')
  },
  {
    id: 'photo-2',
    folderId: 'folder-1',
    projectId: 'proj-1',
    filename: 'DSC_0002.jpg',
    originalName: 'Wedding_Ceremony_002.jpg',
    url: 'https://picsum.photos/800/600?random=2',
    thumbnailUrl: 'https://picsum.photos/300/200?random=2',
    size: 2800000,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15T20:01:00')
  },
  {
    id: 'photo-3',
    folderId: 'folder-2',
    projectId: 'proj-1',
    filename: 'DSC_0003.jpg',
    originalName: 'Wedding_Reception_001.jpg',
    url: 'https://picsum.photos/800/600?random=3',
    thumbnailUrl: 'https://picsum.photos/300/200?random=3',
    size: 3200000,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15T20:02:00')
  },
  {
    id: 'photo-4',
    folderId: 'folder-1',
    projectId: 'proj-1',
    filename: 'DSC_0004.jpg',
    originalName: 'Wedding_Ceremony_003.jpg',
    url: 'https://picsum.photos/800/600?random=4',
    thumbnailUrl: 'https://picsum.photos/300/200?random=4',
    size: 2900000,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15T20:03:00')
  },
  {
    id: 'photo-5',
    folderId: 'folder-2',
    projectId: 'proj-1',
    filename: 'DSC_0005.jpg',
    originalName: 'Wedding_Reception_002.jpg',
    url: 'https://picsum.photos/800/600?random=5',
    thumbnailUrl: 'https://picsum.photos/300/200?random=5',
    size: 3100000,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15T20:04:00')
  },
  {
    id: 'photo-6',
    folderId: 'folder-1',
    projectId: 'proj-1',
    filename: 'DSC_0006.jpg',
    originalName: 'Wedding_Ceremony_004.jpg',
    url: 'https://picsum.photos/800/600?random=6',
    thumbnailUrl: 'https://picsum.photos/300/200?random=6',
    size: 2700000,
    width: 1920,
    height: 1080,
    uploadedAt: new Date('2024-01-15T20:05:00')
  }
];

// In-memory selections store
const selections: Selection[] = [
  {
    id: 'sel-1',
    photoId: 'photo-1',
    projectId: 'proj-1',
    clientId: 'user-2',
    status: 'selected',
    createdAt: new Date('2024-01-16T10:00:00'),
    updatedAt: new Date('2024-01-16T10:00:00')
  },
  {
    id: 'sel-2',
    photoId: 'photo-3',
    projectId: 'proj-1',
    clientId: 'user-2',
    status: 'rejected',
    createdAt: new Date('2024-01-16T10:01:00'),
    updatedAt: new Date('2024-01-16T10:01:00')
  }
];

// GET /api/gallery/:shareToken - Access gallery by share token
router.get('/:shareToken', (req, res) => {
  try {
    const { shareToken } = req.params;
    const { filter, folder, status } = req.query;

    // Find project by share token
    const project = projects.find(p => p.shareToken === shareToken);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Gallery not found or access denied'
      } as ApiResponse);
    }

    if (project.status !== 'shared') {
      return res.status(403).json({
        success: false,
        error: 'Gallery is not currently available for viewing'
      } as ApiResponse);
    }

    // Get project folders and photos
    let projectFolders = folders.filter(f => f.projectId === project.id);
    let projectPhotos = photos.filter(p => p.projectId === project.id);

    // Apply folder filter
    if (folder) {
      projectPhotos = projectPhotos.filter(p => p.folderId === folder);
    }

    // Get selections for each photo
    const photosWithSelections = projectPhotos.map(photo => {
      const selection = selections.find(s => s.photoId === photo.id);
      return {
        ...photo,
        selection: selection ? {
          id: selection.id,
          status: selection.status,
          updatedAt: selection.updatedAt
        } : {
          id: null,
          status: 'pending' as const,
          updatedAt: null
        }
      };
    });

    // Apply status filter
    let filteredPhotos = photosWithSelections;
    if (status && status !== 'all') {
      filteredPhotos = photosWithSelections.filter(p => p.selection.status === status);
    }

    // Calculate stats
    const stats = {
      total: projectPhotos.length,
      selected: selections.filter(s => s.projectId === project.id && s.status === 'selected').length,
      rejected: selections.filter(s => s.projectId === project.id && s.status === 'rejected').length,
      pending: projectPhotos.length - selections.filter(s => s.projectId === project.id).length
    };

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status
        },
        folders: projectFolders,
        photos: filteredPhotos,
        stats
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/gallery/:shareToken/selections/:photoId - Toggle photo selection
router.post('/:shareToken/selections/:photoId', (req, res) => {
  try {
    const { shareToken, photoId } = req.params;
    const { status }: UpdateSelectionRequest = req.body;

    if (!['selected', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "selected", "rejected", or "pending"'
      } as ApiResponse);
    }

    // Find project
    const project = projects.find(p => p.shareToken === shareToken);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Gallery not found'
      } as ApiResponse);
    }

    // Find photo
    const photo = photos.find(p => p.id === photoId && p.projectId === project.id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      } as ApiResponse);
    }

    // Find existing selection
    const existingSelectionIndex = selections.findIndex(
      s => s.photoId === photoId && s.projectId === project.id
    );

    if (status === 'pending') {
      // Remove selection if setting to pending
      if (existingSelectionIndex !== -1) {
        selections.splice(existingSelectionIndex, 1);
      }
    } else {
      // Update or create selection
      if (existingSelectionIndex !== -1) {
        selections[existingSelectionIndex].status = status;
        selections[existingSelectionIndex].updatedAt = new Date();
      } else {
        const newSelection: Selection = {
          id: `sel-${selections.length + 1}`,
          photoId,
          projectId: project.id,
          clientId: 'user-2', // In real app, get from auth
          status,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        selections.push(newSelection);
      }
    }

    res.json({
      success: true,
      data: {
        photoId,
        status,
        updatedAt: new Date()
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/gallery/:shareToken/bulk-selection - Bulk update selections
router.post('/:shareToken/bulk-selection', (req, res) => {
  try {
    const { shareToken } = req.params;
    const { photoIds, status }: { photoIds: string[], status: 'selected' | 'rejected' | 'pending' } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'photoIds array is required'
      } as ApiResponse);
    }

    if (!['selected', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "selected", "rejected", or "pending"'
      } as ApiResponse);
    }

    // Find project
    const project = projects.find(p => p.shareToken === shareToken);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Gallery not found'
      } as ApiResponse);
    }

    // Update selections for each photo
    const results = photoIds.map(photoId => {
      const photo = photos.find(p => p.id === photoId && p.projectId === project.id);
      if (!photo) {
        return { photoId, success: false, error: 'Photo not found' };
      }

      const existingSelectionIndex = selections.findIndex(
        s => s.photoId === photoId && s.projectId === project.id
      );

      if (status === 'pending') {
        if (existingSelectionIndex !== -1) {
          selections.splice(existingSelectionIndex, 1);
        }
      } else {
        if (existingSelectionIndex !== -1) {
          selections[existingSelectionIndex].status = status;
          selections[existingSelectionIndex].updatedAt = new Date();
        } else {
          const newSelection: Selection = {
            id: `sel-${selections.length + 1}`,
            photoId,
            projectId: project.id,
            clientId: 'user-2',
            status,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          selections.push(newSelection);
        }
      }

      return { photoId, success: true, status };
    });

    res.json({
      success: true,
      data: {
        results,
        updated: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/gallery/:shareToken/complete - Mark project as complete
router.post('/:shareToken/complete', (req, res) => {
  try {
    const { shareToken } = req.params;

    const project = projects.find(p => p.shareToken === shareToken);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Gallery not found'
      } as ApiResponse);
    }

    // In real app, would update project status to 'completed' and notify photographer
    
    res.json({
      success: true,
      message: 'Project marked as complete. The photographer has been notified.',
      data: {
        projectId: project.id,
        completedAt: new Date()
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
