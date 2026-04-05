'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api/auth';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfile(token)
      .then(data => setProfile(data))
      .catch(err => setError(err.message));
  }, [router]);

  return (
    <div className="container">
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-2)' }}>
          Bienvenido al panel de gestión de laboratorios
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
        {/* Card de bienvenida */}
        <div className="card">
          <h3>👤 Mi Perfil</h3>
          {profile ? (
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <p style={{ fontSize: '0.9375rem' }}>
                <strong>Usuario:</strong> {profile.username}
              </p>
              <p style={{ fontSize: '0.9375rem', marginTop: 'var(--sp-2)' }}>
                <strong>Roles:</strong>{' '}
                {profile.roles?.length > 0 ? (
                  profile.roles.map((role: string) => (
                    <span key={role} className="badge badge-success" style={{ marginLeft: '4px' }}>
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="badge badge-pending">Sin rol</span>
                )}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-4)' }}>Cargando perfil...</p>
          )}
        </div>

        {/* Card de info */}
        <div className="card">
          <h3>📋 Información del Sistema</h3>
          <p style={{ marginTop: 'var(--sp-4)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Este es el panel central de GestorLab. Navega usando el menú superior para gestionar laboratorios, reservas, actividades e incidencias.
          </p>
        </div>
      </div>
    </div>
  );
}
