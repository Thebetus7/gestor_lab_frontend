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

// Laboratorios disponibles (mock — conectar al endpoint cuando esté disponible)
const LABS_DISPONIBLES = [
  { id: 1, codigo: 'LAB-101' },
  { id: 2, codigo: 'LAB-102' },
  { id: 3, codigo: 'LAB-201' },
  { id: 4, codigo: 'LAB-202' },
  { id: 5, codigo: 'LAB-301' },
  { id: 6, codigo: 'LAB-ADM' },
];

export default function CreateActividadModal({ isOpen, onClose, onSubmit }: Props) {
  const [descripcion, setDescripcion] = useState('');
  const [tareas, setTareas]           = useState<string[]>(['']);
  const [labsSelec, setLabsSelec]     = useState<typeof LABS_DISPONIBLES>([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const handleReset = () => {
    setDescripcion('');
    setTareas(['']);
    setLabsSelec([]);
    setError('');
  };

  const handleClose = () => { handleReset(); onClose(); };

  // Agrega un lab a los seleccionados (evita duplicados)
  const handleLabAdd = (lab: typeof LABS_DISPONIBLES[0]) => {
    if (!labsSelec.find(l => l.id === lab.id)) {
      setLabsSelec(prev => [...prev, lab]);
    }
  };

  // Quita un lab ya seleccionado
  const handleLabRemove = (id: number) => {
    setLabsSelec(prev => prev.filter(l => l.id !== id));
  };

  // Labs que todavía no han sido elegidos (para mostrar en el combobox)
  const labsDisponibles = LABS_DISPONIBLES.filter(l => !labsSelec.find(s => s.id === l.id));

  /** Modifica tarea en el índice dado y agrega campo vacío al final auto */
  const handleTareaChange = (idx: number, val: string) => {
    const next = [...tareas];
    next[idx] = val;
    if (idx === next.length - 1 && val.trim() !== '') next.push('');
    setTareas(next);
  };

  const handleTareaDelete = (idx: number) => {
    if (tareas.length <= 1) { setTareas(['']); return; }
    setTareas(tareas.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const validTareas = tareas.filter(t => t.trim() !== '');
      const labsIds = labsSelec.map(l => l.id);
      
      await onSubmit({
        descripcion: descripcion.trim() || undefined,
        tareas: validTareas,
        laboratorios: labsIds,
      });
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
      {/* Encabezado */}
      <div className={styles.modalHeader}>
        <span className={styles.tag}>Configuración</span>
        <h2 className={styles.title}>Detalles de la Actividad</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Layout de dos columnas */}
      <div className={styles.columns}>

        {/* ── Columna izquierda: Descripción + Laboratorios ── */}
        <div className={styles.leftCol}>

          {/* Descripción */}
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>Descripción</label>
            <textarea
              className={`form-textarea ${styles.textarea}`}
              placeholder="Describe los objetivos y alcances de esta actividad..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          {/* Laboratorios */}
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>Laboratorios</label>

            {/* Pills de labs seleccionados */}
            {labsSelec.length > 0 && (
              <div className={styles.pillsSelected}>
                {labsSelec.map(lab => (
                  <span key={lab.id} className={styles.pill}>
                    {lab.codigo}
                    <button
                      className={styles.pillRemove}
                      onClick={() => handleLabRemove(lab.id)}
                      title={`Quitar ${lab.codigo}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Selector de labs disponibles */}
            {labsDisponibles.length > 0 ? (
              <div className={styles.labOptions}>
                {labsDisponibles.map(lab => (
                  <button
                    key={lab.id}
                    type="button"
                    className={styles.labOption}
                    onClick={() => handleLabAdd(lab)}
                  >
                    + {lab.codigo}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.allSelected}>✓ Todos los laboratorios asignados</p>
            )}
          </div>
        </div>

        {/* ── Columna derecha: Tareas dinámicas ── */}
        <div className={styles.rightCol}>
          <div className={styles.tasksHeader}>
            <span className={styles.tasksTitle}>Lista de Tareas</span>
            {pendingCount > 0 && (
              <span className={styles.taskCount}>
                {pendingCount} tarea{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className={styles.taskList}>
            {tareas.map((tarea, idx) => {
              const isEmpty = tarea.trim() === '';
              const isLast  = idx === tareas.length - 1;
              return (
                <div key={idx} className={styles.taskRow}>
                  <input
                    type="text"
                    className={`form-input ${styles.taskInput} ${isLast && isEmpty ? styles.taskInputEmpty : ''}`}
                    placeholder={isLast && isEmpty ? 'Escribe una nueva tarea...' : `Tarea ${idx + 1}`}
                    value={tarea}
                    onChange={e => handleTareaChange(idx, e.target.value)}
                  />
                  <button
                    className={`${styles.taskDeleteBtn} ${isEmpty ? styles.taskDeleteHidden : ''}`}
                    onClick={() => handleTareaDelete(idx)}
                    tabIndex={-1}
                    title="Eliminar tarea"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
