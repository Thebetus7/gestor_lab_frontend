import React from 'react';
import { type Docente } from '@/lib/api/reserva';

interface GestionDocentesPanelProps {
  showPanel: boolean;
  onClose: () => void;
  docentes: Docente[];
  onSelectDocente: (nombre: string) => void;
  onDeleteDocente: (id: number) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}

export default function GestionDocentesPanel({
  showPanel,
  onClose,
  docentes,
  onSelectDocente,
  onDeleteDocente,
  panelRef
}: GestionDocentesPanelProps) {
  if (!showPanel) return null;

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '280px',
        background: 'var(--bg-card)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--sp-3)',
        zIndex: 1010,
        marginTop: '8px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--surface-container-high)',
        paddingBottom: '6px',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
          Docentes Registrados
        </span>
        <button 
          type="button" 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--outline)' }}
        >
          ✕
        </button>
      </div>
      {docentes.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--outline)', textAlign: 'center', margin: '12px 0' }}>
          No hay docentes registrados aún.
        </p>
      ) : (
        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {docentes.map(d => (
            <div 
              key={d.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px',
                background: 'var(--surface-container-low)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem'
              }}
            >
              <span 
                style={{ 
                  cursor: 'pointer', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  maxWidth: '180px',
                  color: 'var(--on-surface)'
                }}
                onClick={() => onSelectDocente(d.nombre)}
                title="Haz clic para seleccionar"
              >
                👤 {d.nombre}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar a "${d.nombre}" del catálogo de sugerencias?`)) {
                    onDeleteDocente(d.id);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  fontSize: '0.75rem'
                }}
                title="Eliminar del catálogo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: '0.6875rem', color: 'var(--outline)', margin: '8px 0 0 0', textAlign: 'center' }}>
        * Al reservar con un nombre nuevo, se agregará aquí de forma automática.
      </p>
    </div>
  );
}
