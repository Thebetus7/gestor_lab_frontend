'use client';

import { type ActividadList } from '@/lib/api/laboratorio';
import styles from './ActividadesTable.module.css';

interface Props {
  actividades: ActividadList[];
  onShow:   (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ActividadesTable({ actividades, onShow, onDelete }: Props) {
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
    <div className={styles.tableWrapper}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 56 }}>#</th>
            <th>Descripción</th>
            <th style={{ width: 100, textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map(act => (
            <tr key={act.id}>
              <td>
                <span className={styles.id}>#{act.id}</span>
              </td>
              <td>
                <span className={styles.descripcion}>
                  {act.descripcion || (
                    <span style={{ color: 'var(--outline)', fontStyle: 'italic' }}>
                      Sin descripción
                    </span>
                  )}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={`btn btn-icon ${styles.btnShow}`}
                    onClick={() => onShow(act.id)}
                    title="Ver detalles"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    className={`btn btn-icon ${styles.btnDelete}`}
                    onClick={() => onDelete(act.id)}
                    title="Eliminar"
                  >
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
