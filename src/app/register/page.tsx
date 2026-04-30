'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/api/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Frontend UX Validation
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // 1. Registramos al usuario (el backend devuelve mensaje, no token)
      await register(username, email, password);
      
      // 2. Si el registro fue exitoso, redirigimos al login
      setSuccess('¡Cuenta creada con éxito! Redirigiendo al login...');
      
      // 3. Redirigir al login (ruta /login) después de un breve delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Register error:', err);
      // Prioridad a mensajes del backend
      const backendMessage = err.response?.data?.detail || err.detail || err.message;
      
      if (backendMessage) {
        setError(backendMessage);
      } else if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Ocurrió un error inesperado al intentar registrarse.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        padding: 'var(--sp-8) var(--sp-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card" style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
          <h2 style={{ marginBottom: 'var(--sp-2)', textAlign: 'center' }}>
            Crear una cuenta
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--sp-6)', fontSize: '0.9375rem' }}>
            Regístrate para comenzar a usar GestorLab
          </p>

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

          {/* Mensaje de Éxito (UX Feedback) */}
          {success && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#059669', 
              padding: 'var(--sp-3)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: 'var(--sp-4)', 
              fontSize: '0.875rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {success}
            </div>
          )}

          <form onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(e); }}>
            <div className="form-group">
              <label>Usuario</label>
              <input
                type="text"
                className="form-input"
                placeholder="Elige un nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Crea una contraseña segura"
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

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Vuelve a escribir la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              onClick={handleRegister}
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 'var(--sp-4)', height: '44px' }}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p style={{ marginTop: 'var(--sp-6)', textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            ¿Ya tienes una cuenta? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
