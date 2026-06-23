'use client';

import { useState, useEffect } from 'react';
import { type Accesorio, getAccesorios, createAccesorio, deleteAccesorio } from '@/lib/api/laboratorio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccesoriosGlobalModal({ isOpen, onClose }: Props) {
  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');

  const fetchAccesorios = async () => {
    setLoading(true);
    try {
      const data = await getAccesorios();
      setAccesorios(data);
    } catch (err: any) {
      setError('Error al cargar accesorios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccesorios();
      setNombre('');
      setError(null);
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await createAccesorio({ nombre });
      setNombre('');
      await fetchAccesorios();
    } catch (err: any) {
      setError('Error al crear accesorio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este accesorio del catálogo global?')) return;
    setLoading(true);
    try {
      await deleteAccesorio(id);
      await fetchAccesorios();
    } catch (err: any) {
      setError('Error al eliminar accesorio');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: 'var(--sp-4)'
    }}>
      <div style={{
        background: 'var(--surface)', padding: 'var(--sp-6)', 
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Catálogo de Accesorios</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--outline)' }}>&times;</button>
        </div>

        {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: 'var(--sp-3)' }}>{error}</p>}

        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
          <input 
            type="text" 
            placeholder="Nombre (ej: Proyector)" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            required 
            style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '0.875rem' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            {loading ? '...' : '+ Añadir'}
          </button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && accesorios.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--outline)', fontSize: '0.875rem', padding: 'var(--sp-4)' }}>Cargando...</p>
          ) : accesorios.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--outline)', fontSize: '0.875rem', padding: 'var(--sp-4)' }}>No hay accesorios registrados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {accesorios.map(acc => (
                <li key={acc.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--sp-3)', borderBottom: '1px solid var(--outline-variant)',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{acc.nombre}</span>
                  <button 
                    onClick={() => handleDelete(acc.id)} 
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path><polyline points="3 6 5 6 21 6"></polyline></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
