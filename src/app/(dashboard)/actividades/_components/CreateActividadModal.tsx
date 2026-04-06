'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import styles from './CreateActividadModal.module.css';
import { type CreateActividadPayload } from '@/lib/api/laboratorio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateActividadPayload) => Promise<void>;
}

export default function CreateActividadModal({ isOpen, onClose, onSubmit }: Props) {
  const [descripcion, setDescripcion] = useState('');
  const [tareas, setTareas]           = useState<string[]>(['']);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const handleReset = () => {
    setDescripcion('');
    setTareas(['']);
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  /** Modifica una tarea y agrega campo vacío al final automáticamente */
  const handleTareaChange = (idx: number, val: string) => {
    const next = [...tareas];
    next[idx] = val;
    if (idx === next.length - 1 && val.trim() !== '') {
      next.push('');
    }
    setTareas(next);
  };

  /** Elimina una tarea por índice (mínimo 1 queda) */
  const handleTareaDelete = (idx: number) => {
    if (tareas.length <= 1) {
      setTareas(['']);
      return;
    }
    setTareas(tareas.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const validTareas = tareas.filter(t => t.trim() !== '');
      await onSubmit({ descripcion: descripcion.trim() || undefined, tareas: validTareas });
      handleReset();
    } catch (e: any) {
      setError(e.message || 'Error al guardar la actividad');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = tareas.filter(t => t.trim() !== '').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="wide"
      footer={
        <>
          <button className="btn btn-ghost" onClick={handleClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </>
      }
    >
      {/* Tag + Title (sin header del Modal, los ponemos aquí) */}
      <div className={styles.modalHeader}>
        <span className={styles.tag}>Configuración</span>
        <h2 className={styles.title}>Detalles de la Actividad</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Dos columnas */}
      <div className={styles.columns}>
        {/* ── Columna izquierda: Descripción ── */}
        <div className={styles.leftCol}>
          <div className={styles.fieldGroup}>
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              placeholder="Describe los objetivos y alcances de la actividad..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* ── Columna derecha: Tareas dinámicas ── */}
        <div className={styles.rightCol}>
          <div className={styles.tasksHeader}>
            <span className={styles.tasksTitle}>Lista de Tareas</span>
            {pendingCount > 0 && (
              <span className={styles.taskCount}>{pendingCount} tarea{pendingCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className={styles.taskList}>
            {tareas.map((tarea, idx) => {
              const isEmpty = tarea.trim() === '';
              const isLast  = idx === tareas.length - 1;
              return (
                <div key={idx} className={styles.taskRow}>
                  <div className={styles.taskInputWrapper}>
                    <input
                      type="text"
                      className={`form-input ${isLast && isEmpty ? styles.taskInputDashed : ''}`}
                      placeholder={isLast && isEmpty ? 'Escribe una nueva tarea...' : ''}
                      value={tarea}
                      onChange={e => handleTareaChange(idx, e.target.value)}
                      autoFocus={idx === 0}
                    />
                  </div>
                  <button
                    className={`${styles.taskDeleteBtn} ${isEmpty ? styles.taskDeleteHidden : ''}`}
                    onClick={() => handleTareaDelete(idx)}
                    tabIndex={-1}
                    title="Eliminar tarea"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
