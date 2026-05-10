'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(username, password);
      // Guardar token en cookie
      document.cookie = `access_token=${data.access}; path=/; max-age=86400`;
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Intentamos obtener el mensaje detallado del backend si existe
      const backendMessage = err.response?.data?.detail || err.detail;
      
      if (backendMessage) {
        setError(backendMessage);
      } else {
        const errorMsg = err.message?.toLowerCase() || '';
        if (errorMsg.includes('failed to fetch')) {
          setError('No se pudo conectar al servidor. Revisa tu conexión a internet.');
        } else if (err.status === 401 || errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
          setError('Usuario o contraseña incorrectos.');
        } else if (err.status === 500 || errorMsg.includes('500')) {
          setError('Ocurrió un problema en nuestros servidores.');
        } else {
          setError('Ocurrió un error inesperado.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        padding: 'var(--sp-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            GestorLab
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-2)', fontSize: '0.9375rem' }}>
            Sistema de Gestión de Laboratorios
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
          <h2 style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}>
            Iniciar Sesión
          </h2>

          {/* Mensaje de Error (UX Feedback) */}
          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#b91c1c', 
              padding: 'var(--sp-3)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: 'var(--sp-4)', 
              fontSize: '0.875rem',
              border: '1px solid #fecaca',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e as any); }}>
            <div className="form-group">
              <label>Usuario o Correo Electrónico</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ingresa tu usuario o correo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    color: 'var(--text-secondary)'
                  }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleLogin(null as any)}
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 'var(--sp-2)', height: '44px' }}
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
