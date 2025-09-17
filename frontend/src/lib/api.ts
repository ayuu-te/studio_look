import {
  ApiResponse,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  Project,
  CreateProjectRequest,
  CreateFolderRequest,
  Folder,
  GalleryData,
  UpdateSelectionRequest,
  Comment,
  CreateCommentRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper to make authenticated requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear stored token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // In a real app, might redirect to login
    }
    
    const errorData = await response.json().catch(() => ({ 
      success: false, 
      error: `HTTP ${response.status}: ${response.statusText}` 
    }));
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data) {
      // Store token and user in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async signup(userData: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await makeRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data) {
      // Store token and user in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await makeRequest('/auth/logout', {
        method: 'POST',
      });
      
      // Always clear local storage, even if request fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return response;
    } catch (error) {
      // Clear local storage even if logout request fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return makeRequest<User>('/auth/me');
  },

  // Helper to get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

// Projects API
export const projectsApi = {
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return makeRequest<Project[]>('/projects');
  },

  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return makeRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return makeRequest<Project>(`/projects/${projectId}`);
  },

  async updateProject(
    projectId: string, 
    updates: Partial<CreateProjectRequest & { status: string }>
  ): Promise<ApiResponse<Project>> {
    return makeRequest<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async createFolder(
    projectId: string, 
    folderData: CreateFolderRequest
  ): Promise<ApiResponse<Folder>> {
    return makeRequest<Folder>(`/projects/${projectId}/folders`, {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  },

  async getProjectFolders(projectId: string): Promise<ApiResponse<Folder[]>> {
    return makeRequest<Folder[]>(`/projects/${projectId}/folders`);
  },
};

// Gallery API (for client access)
export const galleryApi = {
  async getGallery(
    shareToken: string, 
    filters?: { folder?: string; status?: string }
  ): Promise<ApiResponse<GalleryData>> {
    const searchParams = new URLSearchParams();
    if (filters?.folder) searchParams.set('folder', filters.folder);
    if (filters?.status) searchParams.set('status', filters.status);
    
    const queryString = searchParams.toString();
    const endpoint = `/gallery/${shareToken}${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest<GalleryData>(endpoint);
  },

  async updateSelection(
    shareToken: string,
    photoId: string,
    status: 'selected' | 'rejected' | 'pending'
  ): Promise<ApiResponse<{ photoId: string; status: string; updatedAt: string }>> {
    return makeRequest(`/gallery/${shareToken}/selections/${photoId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async bulkUpdateSelection(
    shareToken: string,
    photoIds: string[],
    status: 'selected' | 'rejected' | 'pending'
  ): Promise<ApiResponse<{ results: any[]; updated: number; failed: number }>> {
    return makeRequest(`/gallery/${shareToken}/bulk-selection`, {
      method: 'POST',
      body: JSON.stringify({ photoIds, status }),
    });
  },

  async completeProject(shareToken: string): Promise<ApiResponse<{ projectId: string; completedAt: string }>> {
    return makeRequest(`/gallery/${shareToken}/complete`, {
      method: 'POST',
    });
  },
};

// Comments API
export const commentsApi = {
  async getPhotoComments(photoId: string): Promise<ApiResponse<{ comments: Comment[]; total: number }>> {
    return makeRequest<{ comments: Comment[]; total: number }>(`/comments/photo/${photoId}`);
  },

  async addComment(
    photoId: string, 
    commentData: CreateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return makeRequest<Comment>(`/comments/photo/${photoId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    return makeRequest<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(commentId: string): Promise<ApiResponse> {
    return makeRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async getProjectComments(projectId: string): Promise<ApiResponse<{
    commentsByPhoto: Record<string, Comment[]>;
    total: number;
    photosWithComments: number;
  }>> {
    return makeRequest(`/comments/project/${projectId}`);
  },
};

// Health check
export const healthApi = {
  async check(): Promise<ApiResponse<{ ok: boolean; timestamp: string }>> {
    return makeRequest('/health');
  },
};

export default {
  auth: authApi,
  projects: projectsApi,
  gallery: galleryApi,
  comments: commentsApi,
  health: healthApi,
};
