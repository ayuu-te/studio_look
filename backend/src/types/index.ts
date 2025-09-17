// User and Auth types
export interface User {
  id: string;
  email: string;
  password: string; // hashed in real implementation
  role: 'photographer' | 'client';
  name: string;
  createdAt: Date;
}

export interface AuthTokens {
  token: string;
  userId: string;
}

// Project and Folder types
export interface Project {
  id: string;
  name: string;
  description?: string;
  photographerId: string;
  shareToken: string;
  status: 'draft' | 'shared' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: Date;
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
    takenAt?: Date;
  };
  uploadedAt: Date;
}

// Selection types
export interface Selection {
  id: string;
  photoId: string;
  projectId: string;
  clientId: string;
  status: 'pending' | 'selected' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Comment types
export interface Comment {
  id: string;
  photoId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId?: string; // for threaded comments
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request types
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
}

export interface UpdateSelectionRequest {
  status: 'selected' | 'rejected' | 'pending';
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

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
