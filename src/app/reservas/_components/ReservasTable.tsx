import React, { useState } from 'react';
import { type Reserva } from '@/lib/api/reserva';

interface TableProps {
  reservas: Reserva[];
  onEdit: (reserva: Reserva) => void;
  onDelete: (id: number) => void;
}

export default function ReservasTable({ reservas, onEdit, onDelete }: TableProps) {
  const [buscar, setBuscar] = useState('');

  // Filtrar reservas localmente
  const reservasFiltradas = reservas.filter(r => {
    const query = buscar.toLowerCase();
    return (
      r.docente_nombre.toLowerCase().includes(query) ||
      (r.laboratorio_nombre || '').toLowerCase().includes(query) ||
      (r.motivo || '').toLowerCase().includes(query) ||
      r.fecha.includes(query)
    );
  });

  const formatearFechaStr = (fStr: string) => {
    if (!fStr) return '';
    const partes = fStr.split('-');
    if (partes.length !== 3) return fStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // DD/MM/YYYY
  };

  return (
    <div>
      {/* Barra de Filtro de Búsqueda */}
      <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'flex-start' }}>
        <div className="form-group" style={{ margin: 0, width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔎 Buscar por docente, lab o motivo..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={{ height: '40px' }}
          />
        </div>
      </div>

      {/* Tabla de Datos */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Laboratorio</th>
              <th>Docente</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Motivo / Descripción</th>
              <th>Registrado Por</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--outline)' }}>
                  {buscar ? 'No se encontraron reservas que coincidan con la búsqueda.' : 'No hay reservas registradas en el sistema.'}
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                    {r.laboratorio_nombre || `Laboratorio #${r.laboratorio}`}
                  </td>
                  <td>{r.docente_nombre}</td>
                  <td>{formatearFechaStr(r.fecha)}</td>
                  <td style={{ fontWeight: 500 }}>
                    🕒 {r.hora_inicio.substring(0, 5)} - {r.hora_fin.substring(0, 5)}
                  </td>
                  <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                    {r.motivo || <span style={{ fontStyle: 'italic', color: 'var(--outline)' }}>Sin motivo</span>}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--outline)' }}>
                    👤 {r.auxiliar_username || 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onEdit(r)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          height: '28px',
                          minWidth: 'auto'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(r.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          height: '28px',
                          minWidth: 'auto'
                        }}
                      >
                        🗑️ Eliminar
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
