import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { projectsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await projectsApi.createProject(newProject);
      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data!]);
        setNewProject({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Dashboard</h1>
        {user?.role === 'photographer' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: 12,
          borderRadius: 4,
          marginBottom: 16,
          color: '#c00'
        }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 16,
          borderRadius: 4,
          marginBottom: 24,
          border: '1px solid #ddd'
        }}>
          <h3>Create New Project</h3>
          <form onSubmit={createProject}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Project Name *
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: 8,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                marginRight: 8
              }}
            >
              Create Project
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {projects.map(project => (
          <div
            key={project.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              backgroundColor: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>
                <Link
                  to={`/projects/${project.id}`}
                  style={{ textDecoration: 'none', color: '#333' }}
                >
                  {project.name}
                </Link>
              </h3>
              <span style={{
                backgroundColor: project.status === 'shared' ? '#28a745' : 
                               project.status === 'completed' ? '#6c757d' : '#ffc107',
                color: project.status === 'draft' ? '#000' : '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {project.status.toUpperCase()}
              </span>
            </div>
            
            {project.description && (
              <p style={{ margin: '8px 0', color: '#666', fontSize: 14 }}>
                {project.description}
              </p>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#888',
              marginTop: 12
            }}>
              <span>
                {project.photoCount || 0} photos • {project.folderCount || 0} folders
              </span>
              <span>
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>

            {project.status === 'shared' && (
              <div style={{ marginTop: 12 }}>
                <Link
                  to={`/gallery/${project.shareToken}`}
                  style={{
                    fontSize: 12,
                    color: '#007bff',
                    textDecoration: 'none'
                  }}
                >
                  View Client Gallery →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && !showCreateForm && (
        <div style={{
          textAlign: 'center',
          padding: 48,
          color: '#666'
        }}>
          <h3>No projects yet</h3>
          <p>
            {user?.role === 'photographer' 
              ? "Create your first project to start sharing photos with clients."
              : "You don't have access to any projects yet."
            }
          </p>
        </div>
      )}
    </div>
  );
}
