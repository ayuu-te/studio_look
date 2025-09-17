import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Project } from '../types';
import { projectsApi } from '../lib/api';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      const response = await projectsApi.getProject(projectId);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.error || 'Failed to load project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (status: 'draft' | 'shared' | 'completed') => {
    if (!projectId) return;
    
    try {
      const response = await projectsApi.updateProject(projectId, { status });
      if (response.success && response.data) {
        setProject(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  if (loading) return <div>Loading project...</div>;
  
  if (error) {
    return (
      <div style={{
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        padding: 16,
        borderRadius: 4,
        color: '#c00'
      }}>
        <h3>Error loading project</h3>
        <p>{error}</p>
        <Link to="/">← Back to Dashboard</Link>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
        <div>
          <h1>{project.name}</h1>
          {project.description && (
            <p style={{ color: '#666', marginBottom: 16 }}>{project.description}</p>
          )}
          
          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666' }}>
            <span><strong>Status:</strong> {project.status}</span>
            <span><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</span>
            <span><strong>Photos:</strong> {project.stats?.photoCount || 0}</span>
            <span><strong>Folders:</strong> {project.stats?.folderCount || 0}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {project.status === 'draft' && (
            <button
              onClick={() => updateProjectStatus('shared')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Share with Client
            </button>
          )}
          
          {project.status === 'shared' && (
            <>
              <Link
                to={`/gallery/${project.shareToken}`}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                View Gallery
              </Link>
              <button
                onClick={() => updateProjectStatus('completed')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Mark Complete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Share link section */}
      {project.status === 'shared' && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          padding: 16,
          borderRadius: 4,
          marginBottom: 24
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Client Gallery Link</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>
            Share this link with your client to allow them to view and select photos:
          </p>
          <div style={{ 
            backgroundColor: 'white', 
            padding: 8, 
            borderRadius: 4, 
            border: '1px solid #ddd',
            fontFamily: 'monospace',
            fontSize: 12
          }}>
            {window.location.origin}/gallery/{project.shareToken}
          </div>
        </div>
      )}

      {/* Folders section */}
      <div style={{ marginBottom: 32 }}>
        <h2>Folders</h2>
        {project.folders && project.folders.length > 0 ? (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {project.folders.map(folder => (
              <div
                key={folder.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 16,
                  backgroundColor: 'white'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0' }}>{folder.name}</h4>
                {folder.description && (
                  <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>
                    {folder.description}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                  Created: {new Date(folder.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No folders created yet.</p>
        )}
      </div>

      {/* Photos section */}
      <div>
        <h2>Recent Photos</h2>
        {project.photos && project.photos.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {project.photos.slice(0, 12).map(photo => (
              <div
                key={photo.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.originalName}
                  style={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: 8 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {photo.originalName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No photos uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
