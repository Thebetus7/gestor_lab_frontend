'use client';

import { useState, useEffect } from 'react';
import { type CreateLaboratorioPayload } from '@/lib/api/laboratorio';
import styles from './LaboratorioModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLaboratorioPayload) => Promise<void>;
}

export default function LaboratorioModal({ isOpen, onClose, onSubmit }: Props) {
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [maquinasCount, setMaquinasCount] = useState<number | ''>('');
  const [filas, setFilas] = useState<number | ''>('');
  const [columnas, setColumnas] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Calcular predeterminados de filas y columnas cuando cambia maquinasCount
  const handleMaquinasChange = (val: number | '') => {
    setMaquinasCount(val);
    if (typeof val === 'number' && val > 0) {
      const c = Math.ceil(Math.sqrt(val));
      const f = Math.ceil(val / c);
      setFilas(f);
      setColumnas(c);
    } else {
      setFilas('');
      setColumnas('');
    }
    // Ocultar mensaje de éxito previo si empieza a escribir de nuevo
    setSuccessMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await onSubmit({
        nombre,
        capacidad,
        filas: Number(filas) || 0,
        columnas: Number(columnas) || 0,
        maquinas_count: Number(maquinasCount) || 0,
      });
      // Éxito: Limpiar campos y mostrar mensaje amigable
      setSuccessMsg(`¡El laboratorio "${nombre}" se creó correctamente!`);
      setNombre('');
      setCapacidad('');
      setMaquinasCount('');
      setFilas('');
      setColumnas('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessMsg('');
    setNombre('');
    setCapacidad('');
    setMaquinasCount('');
    setFilas('');
    setColumnas('');
    onClose();
  };

  const f = Number(filas) || 0;
  const c = Number(columnas) || 0;
  const mc = Number(maquinasCount) || 0;
  const totalSlots = f * c;

  const gridItems = [];
  for (let i = 0; i < totalSlots; i++) {
    if (i < mc) {
      gridItems.push(<div key={i} className={styles.pcIcon}>PC</div>);
    } else {
      gridItems.push(<div key={i} style={{ width: 36, height: 36, border: '2px dashed var(--outline)', borderRadius: 6 }}></div>);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Registrar Laboratorio</h2>
          <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        </div>

        {successMsg && (
          <div className={styles.successMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nombre del Laboratorio (Aula)</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={e => { setNombre(e.target.value); setSuccessMsg(''); }}
              placeholder="Ej: Lab Redes A"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Capacidad</label>
            <input
              type="text"
              value={capacidad}
              onChange={e => { setCapacidad(e.target.value); setSuccessMsg(''); }}
              placeholder="Ej: 30 Estudiantes"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cantidad de Máquinas (PCs)</label>
            <input
              type="number"
              min="0"
              required
              value={maquinasCount}
              onChange={e => handleMaquinasChange(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Ej: 20"
            />
          </div>

          <div className={styles.gridControls}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label>Filas</label>
              <input
                type="number"
                min="1"
                value={filas}
                onChange={e => { setFilas(e.target.value === '' ? '' : parseInt(e.target.value)); setSuccessMsg(''); }}
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label>Columnas</label>
              <input
                type="number"
                min="1"
                value={columnas}
                onChange={e => { setColumnas(e.target.value === '' ? '' : parseInt(e.target.value)); setSuccessMsg(''); }}
              />
            </div>
          </div>

          {(f > 0 && c > 0) && (
            <div className={styles.roomPreview}>
              <div 
                className={styles.roomGrid} 
                style={{ gridTemplateColumns: `repeat(${c}, 1fr)` }}
              >
                {gridItems}
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar y Crear Otro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
