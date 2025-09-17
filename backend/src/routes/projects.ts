import express from 'express';
import { ApiResponse, Project, Folder, CreateProjectRequest, CreateFolderRequest, Photo } from '../types/index.js';

const router = express.Router();

// Mock data stores
const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Wedding Photos - Smith Family',
    description: 'Beautiful outdoor wedding ceremony',
    photographerId: 'user-1',
    shareToken: 'share-wedding-smith-2024',
    status: 'shared',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'proj-2',
    name: 'Portrait Session - Johnson',
    description: 'Family portrait session at the park',
    photographerId: 'user-1',
    shareToken: 'share-portrait-johnson-2024',
    status: 'draft',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

const folders: Folder[] = [
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
  },
  {
    id: 'folder-3',
    projectId: 'proj-2',
    name: 'Main Session',
    description: 'Primary portrait photos',
    createdAt: new Date('2024-01-20')
  }
];

const photos: Photo[] = [
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
  }
];

// Simple auth middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    } as ApiResponse);
  }
  // In real app, validate token and get user
  next();
}

// GET /api/projects - List all projects for current user
router.get('/', requireAuth, (req, res) => {
  try {
    // In real app, filter by current user
    const userProjects = projects.map(project => ({
      ...project,
      folderCount: folders.filter(f => f.projectId === project.id).length,
      photoCount: photos.filter(p => p.projectId === project.id).length
    }));

    res.json({
      success: true,
      data: userProjects
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/projects - Create new project
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, description }: CreateProjectRequest = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      } as ApiResponse);
    }

    const newProject: Project = {
      id: `proj-${projects.length + 1}`,
      name,
      description,
      photographerId: 'user-1', // In real app, get from auth
      shareToken: `share-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projects.push(newProject);

    res.status(201).json({
      success: true,
      data: newProject
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', requireAuth, (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as ApiResponse);
    }

    const projectFolders = folders.filter(f => f.projectId === project.id);
    const projectPhotos = photos.filter(p => p.projectId === project.id);

    res.json({
      success: true,
      data: {
        ...project,
        folders: projectFolders,
        photos: projectPhotos,
        stats: {
          folderCount: projectFolders.length,
          photoCount: projectPhotos.length,
          totalSize: projectPhotos.reduce((sum, p) => sum + p.size, 0)
        }
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', requireAuth, (req, res) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as ApiResponse);
    }

    const { name, description, status } = req.body;
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: projects[projectIndex]
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/projects/:id/folders - Create folder in project
router.post('/:id/folders', requireAuth, (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as ApiResponse);
    }

    const { name, description }: CreateFolderRequest = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      } as ApiResponse);
    }

    const newFolder: Folder = {
      id: `folder-${folders.length + 1}`,
      projectId: project.id,
      name,
      description,
      createdAt: new Date()
    };

    folders.push(newFolder);

    res.status(201).json({
      success: true,
      data: newFolder
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// GET /api/projects/:id/folders - Get project folders
router.get('/:id/folders', requireAuth, (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      } as ApiResponse);
    }

    const projectFolders = folders.filter(f => f.projectId === project.id);

    res.json({
      success: true,
      data: projectFolders
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
