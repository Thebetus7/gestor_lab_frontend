'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(username, password);
      document.cookie = `access_token=${data.access}; path=/; max-age=86400`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
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

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Usuario</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
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
