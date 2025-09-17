import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { GalleryPage } from '../pages/GalleryPage';
import { NotFoundPage } from '../pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/gallery/share-wedding-smith-2024">Client Gallery (Demo)</Link>
        </nav>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>Signed in as {user.name} ({user.role})</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell>
                  <DashboardPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <Shell>
                  <ProjectDetailPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery/:shareToken"
            element={
              <Shell>
                <GalleryPage />
              </Shell>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
