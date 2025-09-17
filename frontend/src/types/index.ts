// User and Auth types
export interface User {
  id: string;
  email: string;
  role: 'photographer' | 'client';
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Project and Folder types
export interface Project {
  id: string;
  name: string;
  description?: string;
  photographerId: string;
  shareToken: string;
  status: 'draft' | 'shared' | 'completed';
  createdAt: string;
  updatedAt: string;
  folderCount?: number;
  photoCount?: number;
  folders?: Folder[];
  photos?: Photo[];
  stats?: {
    folderCount: number;
    photoCount: number;
    totalSize: number;
  };
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Photo types
export interface Photo {
  id: string;
  folderId: string;
  projectId: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  metadata?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    takenAt?: string;
  };
  uploadedAt: string;
  selection?: {
    id: string | null;
    status: 'pending' | 'selected' | 'rejected';
    updatedAt: string | null;
  };
}

// Selection types
export interface Selection {
  id: string;
  photoId: string;
  projectId: string;
  clientId: string;
  status: 'pending' | 'selected' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  photoId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId?: string;
  createdAt: string;
  replies?: Comment[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Gallery data type
export interface GalleryData {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
  };
  folders: Folder[];
  photos: Photo[];
  stats: {
    total: number;
    selected: number;
    rejected: number;
    pending: number;
  };
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'photographer' | 'client';
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateSelectionRequest {
  status: 'selected' | 'rejected' | 'pending';
}
