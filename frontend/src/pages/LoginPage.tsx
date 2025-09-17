import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { login, signup, isAuthenticated } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'photographer' as 'photographer' | 'client'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Quick login demo buttons
  const quickLogin = async (userType: 'photographer' | 'client') => {
    setError('');
    setLoading(true);
    try {
      await login({
        email: userType === 'photographer' ? 'photographer@example.com' : 'client@example.com',
        password: 'password123'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24, color: '#333' }}>
          📸 Photo Share App
        </h1>

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            {isSignup 
              ? 'Create your photographer or client account' 
              : 'Access your dashboard or shared galleries'
            }
          </p>
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

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14
                }}
              >
                <option value="photographer">Photographer</option>
                <option value="client">Client</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        {/* Demo login buttons */}
        <div style={{ 
          borderTop: '1px solid #eee', 
          paddingTop: 24,
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Quick demo login:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => quickLogin('photographer')}
              disabled={loading}
              style={{
                flex: 1,
                padding: 8,
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Login as Photographer
            </button>
            <button
              onClick={() => quickLogin('client')}
              disabled={loading}
              style={{
                flex: 1,
                padding: 8,
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Login as Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
