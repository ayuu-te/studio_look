import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8f9fa',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: 72, margin: 0, color: '#6c757d' }}>404</h1>
        <h2 style={{ margin: '16px 0', color: '#333' }}>Page Not Found</h2>
        <p style={{ margin: '16px 0', color: '#666' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            display: 'inline-block',
            marginTop: 16
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
