'use client';

import { useState } from 'react';
import { type ActividadList } from '@/lib/api/laboratorio';
import styles from './ActividadesTable.module.css';

interface Props {
  actividades: ActividadList[];
  onShow:   (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ActividadesTable({ actividades, onShow, onDelete }: Props) {
  // Estado para controlar qué popover de filtro de columna está abierto
  const [activePopover, setActivePopover] = useState<'id' | 'descripcion' | null>(null);

  // Estados de Filtro de Columnas
  const [filterId, setFilterId] = useState('');
  const [filterDesc, setFilterDesc] = useState('');

  // Lógica de filtrado reactiva acumulativa
  const filteredActividades = actividades.filter((act) => {
    const idMatch = !filterId || act.id.toString().includes(filterId.trim());
    
    const descMatch = !filterDesc || 
      (act.descripcion || '').toLowerCase().includes(filterDesc.toLowerCase());

    return idMatch && descMatch;
  });

  const handleTogglePopover = (col: 'id' | 'descripcion') => {
    setActivePopover(prev => prev === col ? null : col);
  };

  const closePopovers = () => {
    setActivePopover(null);
  };

  // Icono SVG de Embudo / Filtro
  const FilterIcon = ({ isActive }: { isActive: boolean }) => (
    <svg 
      width="13" 
      height="13" 
      viewBox="0 0 24 24" 
      fill={isActive ? 'var(--accent)' : 'none'} 
      stroke={isActive ? 'var(--accent)' : 'currentColor'} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginLeft: 6, cursor: 'pointer', verticalAlign: 'middle', transition: 'color 0.2s' }}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );

  if (actividades.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p>No hay actividades registradas.</p>
        <span>Crea la primera usando el botón de arriba.</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Overlay invisible para cerrar el popover al hacer clic fuera */}
      {activePopover && (
        <div 
          onClick={closePopovers}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90,
            background: 'transparent',
            cursor: 'default'
          }}
        />
      )}

      <div className={styles.tableWrapper} style={{ overflowX: 'visible' }}>
        <table className="data-table">
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              
              {/* Columna ID */}
              <th style={{ width: 120, textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('id')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: filterId ? 'var(--accent)' : 'inherit' }}>
                  ID #
                  <FilterIcon isActive={!!filterId} />
                </span>
                {activePopover === 'id' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '180px', marginTop: '4px', textAlign: 'left' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--sp-2)' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block' }}>Buscar ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={filterId} 
                        onChange={(e) => setFilterId(e.target.value)}
                        placeholder="Escribe ID..."
                        autoFocus
                        style={{ fontSize: '0.85rem', padding: '6px 8px', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    {filterId && (
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => { setFilterId(''); closePopovers(); }}
                        style={{ fontSize: '0.75rem', padding: '4px 0', width: '100%', textAlign: 'center', color: 'var(--danger)' }}
                      >
                        Limpiar Filtro
                      </button>
                    )}
                  </div>
                )}
              </th>

              {/* Columna Descripción */}
              <th style={{ textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('descripcion')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: filterDesc ? 'var(--accent)' : 'inherit' }}>
                  Descripción
                  <FilterIcon isActive={!!filterDesc} />
                </span>
                {activePopover === 'descripcion' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '260px', marginTop: '4px', textAlign: 'left' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--sp-2)' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block' }}>Buscar por descripción</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={filterDesc} 
                        onChange={(e) => setFilterDesc(e.target.value)}
                        placeholder="Escribe palabra clave..."
                        autoFocus
                        style={{ fontSize: '0.85rem', padding: '6px 8px', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    {filterDesc && (
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => { setFilterDesc(''); closePopovers(); }}
                        style={{ fontSize: '0.75rem', padding: '4px 0', width: '100%', textAlign: 'center', color: 'var(--danger)' }}
                      >
                        Limpiar Filtro
                      </button>
                    )}
                  </div>
                )}
              </th>

              <th style={{ width: 140, textAlign: 'center', padding: 'var(--sp-3) var(--sp-4)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredActividades.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--outline)' }}>
                  No se encontraron actividades que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredActividades.map(act => (
                <tr key={act.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: 'var(--sp-4)' }}><span className={styles.id}>#{act.id}</span></td>
                  <td style={{ padding: 'var(--sp-4)' }}>
                    <span className={styles.descripcion}>
                      {act.descripcion || (
                        <span style={{ color: 'var(--outline)', fontStyle: 'italic' }}>Sin descripción</span>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                    <div className={styles.actions}>
                      <button className={`btn btn-icon ${styles.btnShow}`} onClick={() => onShow(act.id)} title="Ver detalles">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button className={`btn btn-icon ${styles.btnDelete}`} onClick={() => onDelete(act.id)} title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
