'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api/auth';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Para simplificar, leemos la cookie desde el lado del cliente.
    // Next.js también permite middleware o SSR, que es más seguro.
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

  const handleLogout = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Dashboard</h2>
          <button onClick={handleLogout} className="btn" style={{ width: 'auto', backgroundColor: '#dc2626' }}>
            Cerrar Sesión
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        
        {profile ? (
          <div>
            <p><strong>Bienvenido:</strong> {profile.username}</p>
            <p><strong>Roles asignados:</strong> {profile.roles?.join(', ') || 'Ninguno'}</p>
          </div>
        ) : (
          <p>Cargando perfil...</p>
        )}
      </div>
      
      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Información del Sistema</h3>
        <p style={{ marginTop: '12px' }}>
          Este es el área remota protegida. Cualquier otra funcionalidad del proyecto debería agregarse aquí como componentes y módulos separados de Next.js.
        </p>
      </div>
    </div>
  );
}
