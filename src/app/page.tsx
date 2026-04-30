'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación leyendo la cookie
    const checkAuth = async () => {
      const match = document.cookie.match(/(^| )access_token=([^;]+)/);
      const token = match ? match[2] : null;

      if (!token) {
        // Redirigir al welcome si no está autenticado
        router.push('/welcome');
        return;
      }

      try {
        const userData = await fetchProfile(token);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Token inválido o expirado
        document.cookie = 'access_token=; path=/; max-age=0';
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-8)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
            Bienvenido, {user?.first_name || user?.username}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Aquí tienes un resumen de tu entorno de laboratorio.
          </p>
        </div>
      </div>

      {/* Grid de tarjetas de ejemplo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-6)' }}>
        
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ padding: 'var(--sp-2)', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Equipos</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>Gestiona el inventario y estado de los equipos.</p>
          <button className="btn" style={{ width: '100%', background: 'var(--bg-subtle)' }}>Ver Equipos</button>
        </div>

        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ padding: 'var(--sp-2)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-md)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Reservas</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>Programa y administra los horarios de uso.</p>
          <button className="btn" style={{ width: '100%', background: 'var(--bg-subtle)' }}>Ver Calendario</button>
        </div>

      </div>
    </div>
  );
}
