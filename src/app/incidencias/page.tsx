'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { getIncidencias, resolverIncidencia, type Incidencia } from '@/lib/api/laboratorio';

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'resueltas'>('pendientes');

  const fetchIncidencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener incidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const handleResolver = async (id: number) => {
    if (!confirm('¿Marcar esta incidencia como resuelta?')) return;
    try {
      await resolverIncidencia(id, true);
      await fetchIncidencias();
    } catch (err: any) {
      alert('Error al resolver incidencia: ' + err.message);
    }
  };

  const incidenciasFiltradas = incidencias.filter((inc) => {
    if (filtroEstado === 'pendientes') return !inc.resuelto;
    if (filtroEstado === 'resueltas') return inc.resuelto;
    return true;
  });

  return (
    <div className="container">
      <PageHeader
        tag="Soporte"
        title="Incidencias"
        subtitle="Registro de problemas técnicos reportados desde dispositivos móviles"
      />

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
        <button
          className={`btn ${filtroEstado === 'pendientes' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFiltroEstado('pendientes')}
        >
          Pendientes
        </button>
        <button
          className={`btn ${filtroEstado === 'resueltas' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFiltroEstado('resueltas')}
        >
          Resueltas
        </button>
        <button
          className={`btn ${filtroEstado === 'todos' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todas
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--on-surface-variant)' }}>
            Cargando incidencias...
          </p>
        ) : incidenciasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--on-surface-variant)' }}>
            No hay incidencias que coincidan con el filtro.
          </div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>ID</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Descripción</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Prioridad</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Laboratorio</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Accesorio</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Reportado por</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-3)' }}>Estado</th>
                <th style={{ textAlign: 'center', padding: 'var(--sp-3)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidenciasFiltradas.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: '1px solid var(--outline-variant)', height: '56px' }}>
                  <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>#{inc.id}</td>
                  <td style={{ padding: 'var(--sp-3)' }}>{inc.descripcion}</td>
                  <td style={{ padding: 'var(--sp-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          inc.prioridad === 'alta'
                            ? 'var(--error-container, #FFDAD6)'
                            : inc.prioridad === 'media'
                            ? 'var(--tertiary-container, #EADDFF)'
                            : 'var(--surface-container-high, #ECE6F0)',
                        color:
                          inc.prioridad === 'alta'
                            ? 'var(--error, #BA1A1A)'
                            : inc.prioridad === 'media'
                            ? 'var(--tertiary, #6750A4)'
                            : 'var(--on-surface-variant, #49454F)',
                      }}
                    >
                      {inc.prioridad?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-3)' }}>{inc.nombre_lab || 'General'}</td>
                  <td style={{ padding: 'var(--sp-3)', fontStyle: inc.nombre_accesorio ? 'normal' : 'italic', color: inc.nombre_accesorio ? 'inherit' : 'var(--outline)' }}>
                    {inc.nombre_accesorio || 'N/A'}
                  </td>
                  <td style={{ padding: 'var(--sp-3)', fontStyle: 'italic' }}>
                    {inc.username_usuario || 'Sistema'}
                  </td>
                  <td style={{ padding: 'var(--sp-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: inc.resuelto ? '#E8F5E9' : '#FFF3E0',
                        color: inc.resuelto ? '#2E7D32' : '#E65100',
                      }}
                    >
                      {inc.resuelto ? 'Resuelto' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-3)', textAlign: 'center' }}>
                    {!inc.resuelto && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                        onClick={() => handleResolver(inc.id)}
                      >
                        ✓ Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
