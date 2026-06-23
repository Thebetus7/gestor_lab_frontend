'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api/auth';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) { router.push('/login'); return; }

    fetchProfile(token)
      .then(data => setProfile(data))
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="container">
      <PageHeader
        tag="Panel de Control"
        title="Dashboard"
        subtitle="Visualización global del sistema GestorLab"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-5)' }}>
        {/* Card perfil */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--primary-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem',
              color: 'var(--inverse-primary)',
            }}>
              {profile?.username?.slice(0, 2).toUpperCase() || '--'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {profile?.username || 'Cargando...'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                {profile?.roles?.length > 0 ? profile.roles.join(', ') : 'Sin rol asignado'}
              </div>
            </div>
          </div>
          <hr className="divider" />
          <div style={{ marginTop: 'var(--sp-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {profile?.roles?.map((role: string) => (
              <Badge key={role} variant="accent">{role}</Badge>
            )) || <Badge variant="pending">Sin rol</Badge>}
          </div>
        </div>

        {/* Card accesos rápidos */}
        <div className="card">
          <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', marginBottom: 'var(--sp-4)' }}>
            Accesos Rápidos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {[
              { label: 'Actividades', href: '/actividades', icon: '📋' },
              { label: 'Incidencias', href: '/incidencias', icon: '⚠️' },
              { label: 'Reservas',    href: '/reservas',    icon: '📅' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface-container-low)',
                  textDecoration: 'none',
                  color: 'var(--on-surface)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Card info */}
        <div className="card">
          <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', marginBottom: 'var(--sp-3)' }}>
            Acerca del Sistema
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            GestorLab centraliza la gestión de laboratorios, actividades, reservas e incidencias en un solo lugar para todas las áreas.
          </p>
        </div>
      </div>
    </div>
  );
}
