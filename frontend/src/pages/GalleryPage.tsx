import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GalleryData, Photo } from '../types';
import { galleryApi, commentsApi } from '../lib/api';

export function GalleryPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    folder: '',
    status: 'all'
  });

  useEffect(() => {
    if (shareToken) {
      loadGallery();
    }
  }, [shareToken, filters]);

  const loadGallery = async () => {
    if (!shareToken) return;
    
    try {
      const response = await galleryApi.getGallery(shareToken, filters);
      if (response.success && response.data) {
        setGallery(response.data);
      } else {
        setError(response.error || 'Failed to load gallery');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = async (photoId: string, status: 'selected' | 'rejected' | 'pending') => {
    if (!shareToken) return;
    
    try {
      await galleryApi.updateSelection(shareToken, photoId, status);
      await loadGallery(); // Refresh gallery
    } catch (err) {
      console.error('Failed to update selection:', err);
    }
  };

  const bulkUpdateSelection = async (status: 'selected' | 'rejected' | 'pending') => {
    if (!shareToken || selectedPhotos.size === 0) return;
    
    try {
      await galleryApi.bulkUpdateSelection(shareToken, Array.from(selectedPhotos), status);
      setSelectedPhotos(new Set());
      await loadGallery(); // Refresh gallery
    } catch (err) {
      console.error('Failed to bulk update:', err);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  if (loading) return <div>Loading gallery...</div>;
  
  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 48,
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: 8,
        color: '#c00'
      }}>
        <h2>Gallery Access Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!gallery) return <div>Gallery not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>{gallery.project.name}</h1>
        {gallery.project.description && (
          <p style={{ color: '#666', marginBottom: 16 }}>{gallery.project.description}</p>
        )}
        
        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          gap: 24, 
          marginBottom: 16,
          fontSize: 14,
          color: '#666'
        }}>
          <span><strong>{gallery.stats.total}</strong> total photos</span>
          <span style={{ color: '#28a745' }}><strong>{gallery.stats.selected}</strong> selected</span>
          <span style={{ color: '#dc3545' }}><strong>{gallery.stats.rejected}</strong> rejected</span>
          <span style={{ color: '#6c757d' }}><strong>{gallery.stats.pending}</strong> pending</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 4
      }}>
        <div>
          <label style={{ marginRight: 8, fontWeight: 'bold' }}>Folder:</label>
          <select 
            value={filters.folder}
            onChange={(e) => setFilters(prev => ({ ...prev, folder: e.target.value }))}
            style={{ padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
          >
            <option value="">All folders</option>
            {gallery.folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: 8, fontWeight: 'bold' }}>Status:</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
          >
            <option value="all">All photos</option>
            <option value="pending">Pending</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedPhotos.size > 0 && (
        <div style={{
          padding: 16,
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: 4,
          marginBottom: 24
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>
            {selectedPhotos.size} photo{selectedPhotos.size > 1 ? 's' : ''} selected
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => bulkUpdateSelection('selected')}
              style={{
                padding: '4px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Select All
            </button>
            <button
              onClick={() => bulkUpdateSelection('rejected')}
              style={{
                padding: '4px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Reject All
            </button>
            <button
              onClick={() => bulkUpdateSelection('pending')}
              style={{
                padding: '4px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Reset All
            </button>
            <button
              onClick={() => setSelectedPhotos(new Set())}
              style={{
                padding: '4px 12px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 16
      }}>
        {gallery.photos.map(photo => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotos.has(photo.id)}
            onToggleSelect={() => togglePhotoSelection(photo.id)}
            onUpdateSelection={(status) => updateSelection(photo.id, status)}
          />
        ))}
      </div>

      {gallery.photos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 48,
          color: '#666'
        }}>
          <h3>No photos to display</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateSelection: (status: 'selected' | 'rejected' | 'pending') => void;
}

function PhotoCard({ photo, isSelected, onToggleSelect, onUpdateSelection }: PhotoCardProps) {
  const selectionStatus = photo.selection?.status || 'pending';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: 'white',
      position: 'relative'
    }}>
      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 16,
          height: 16,
          zIndex: 2
        }}
      />

      {/* Status badge */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: getStatusColor(selectionStatus),
        color: 'white',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        zIndex: 2
      }}>
        {selectionStatus}
      </div>

      {/* Photo */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.originalName}
        style={{
          width: '100%',
          height: 200,
          objectFit: 'cover'
        }}
      />

      {/* Photo info */}
      <div style={{ padding: 12 }}>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontSize: 12, 
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {photo.originalName}
        </p>
        
        {photo.metadata && (
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: 11, 
            color: '#666'
          }}>
            {photo.metadata.camera} • {photo.metadata.aperture} • ISO {photo.metadata.iso}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onUpdateSelection('selected')}
            disabled={selectionStatus === 'selected'}
            style={{
              flex: 1,
              padding: 6,
              backgroundColor: selectionStatus === 'selected' ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              cursor: selectionStatus === 'selected' ? 'not-allowed' : 'pointer'
            }}
          >
            ✓ Select
          </button>
          <button
            onClick={() => onUpdateSelection('rejected')}
            disabled={selectionStatus === 'rejected'}
            style={{
              flex: 1,
              padding: 6,
              backgroundColor: selectionStatus === 'rejected' ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              cursor: selectionStatus === 'rejected' ? 'not-allowed' : 'pointer'
            }}
          >
            ✕ Reject
          </button>
          {selectionStatus !== 'pending' && (
            <button
              onClick={() => onUpdateSelection('pending')}
              style={{
                flex: 1,
                padding: 6,
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
