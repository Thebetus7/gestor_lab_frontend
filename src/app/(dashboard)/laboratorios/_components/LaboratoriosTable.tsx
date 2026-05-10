'use client';

import { type Laboratorio } from '@/lib/api/laboratorio';
import styles from './LaboratoriosTable.module.css';

interface Props {
  laboratorios: Laboratorio[];
  onDelete: (id: number) => void;
}

export default function LaboratoriosTable({ laboratorios, onDelete }: Props) {
  if (laboratorios.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <p>No hay laboratorios registrados.</p>
        <span>Crea el primero usando el botón de arriba.</span>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 56 }}>#</th>
            <th>Nombre</th>
            <th>Capacidad</th>
            <th>Filas</th>
            <th>Columnas</th>
            <th>Maquinas Totales</th>
            <th style={{ width: 120, textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {laboratorios.map(lab => (
            <tr key={lab.id}>
              <td><span className={styles.id}>#{lab.id}</span></td>
              <td>
                <span className={styles.descripcion}>
                  {lab.nombre || (
                    <span style={{ color: 'var(--outline)', fontStyle: 'italic' }}>Sin nombre</span>
                  )}
                </span>
              </td>
              <td>{lab.capacidad || '-'}</td>
              <td>{lab.filas}</td>
              <td>{lab.columnas}</td>
              <td>{lab.maquinas_count}</td>
              <td>
                <div className={styles.actions}>
                  <button className={`btn btn-icon ${styles.btnDelete}`} onClick={() => onDelete(lab.id)} title="Eliminar">
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
