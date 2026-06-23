'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import styles from './CreateActividadModal.module.css';
import { getLaboratorios, type Laboratorio, type CreateActividadPayload } from '@/lib/api/laboratorio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateActividadPayload) => Promise<void>;
}

export default function CreateActividadModal({ isOpen, onClose, onSubmit }: Props) {
  const [descripcion, setDescripcion] = useState('');
  const [tareas, setTareas]           = useState<string[]>(['']);
  const [labsSelec, setLabsSelec]     = useState<Laboratorio[]>([]);
  const [laboratoriosList, setLaboratoriosList] = useState<Laboratorio[]>([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  // Cargar laboratorios del backend al abrir el modal
  useEffect(() => {
    if (isOpen) {
      getLaboratorios()
        .then(data => {
          setLaboratoriosList(data);
        })
        .catch(err => {
          console.error('Error al cargar laboratorios para actividad', err);
          setError('No se pudieron cargar los laboratorios del sistema.');
        });
    }
  }, [isOpen]);

  const handleReset = () => {
    setDescripcion('');
    setTareas(['']);
    setLabsSelec([]);
    setError('');
  };

  const handleClose = () => { 
    handleReset(); 
    onClose(); 
  };

  // Agrega un laboratorio a los seleccionados
  const handleLabAdd = (lab: Laboratorio) => {
    if (!labsSelec.find(l => l.id === lab.id)) {
      setLabsSelec(prev => [...prev, lab]);
    }
  };

  // Quita un laboratorio ya seleccionado
  const handleLabRemove = (id: number) => {
    setLabsSelec(prev => prev.filter(l => l.id !== id));
  };

  // Laboratorios que todavía no han sido elegidos
  const labsDisponibles = laboratoriosList.filter(l => !labsSelec.find(s => s.id === l.id));

  // Modifica tarea en el índice dado y agrega campo vacío al final de forma interactiva
  const handleTareaChange = (idx: number, val: string) => {
    const next = [...tareas];
    next[idx] = val;
    if (idx === next.length - 1 && val.trim() !== '') {
      next.push('');
    }
    setTareas(next);
  };

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
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Crear Actividad'}
          </button>
        </div>
      }
    >
      {/* Encabezado del Modal */}
      <div className={styles.modalHeader}>
        <span className={styles.tag}>Gestión</span>
        <h2 className={styles.title}>Nueva Actividad Académica</h2>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {/* Grid de 2 Columnas Premium bien dimensionado */}
      <div className={styles.columns}>

        {/* Columna Izquierda: Información Básica & Laboratorios */}
        <div className={styles.leftCol}>
          
          {/* Descripción */}
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>Objetivo / Descripción de la Actividad</label>
            <textarea
              className={`form-textarea ${styles.textarea}`}
              placeholder="Describe detalladamente los objetivos y alcances de esta actividad..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          {/* Selección de Laboratorios */}
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel}>Asignar a Laboratorios</label>
            
            {/* Pills de laboratorios seleccionados */}
            <div className={styles.pillsContainer}>
              {labsSelec.length === 0 ? (
                <span className={styles.noLabsSelected}>Ningún laboratorio seleccionado todavía.</span>
              ) : (
                <div className={styles.pillsSelected}>
                  {labsSelec.map(lab => (
                    <span key={lab.id} className={styles.pill}>
                      🏢 {lab.nombre}
                      <button
                        type="button"
                        className={styles.pillRemove}
                        onClick={() => handleLabRemove(lab.id)}
                        title={`Quitar ${lab.nombre}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de laboratorios disponibles (Chips) */}
            <div className={styles.availableSection}>
              <span className={styles.availableLabel}>Laboratorios Disponibles:</span>
              {labsDisponibles.length > 0 ? (
                <div className={styles.labOptions}>
                  {labsDisponibles.map(lab => (
                    <button
                      key={lab.id}
                      type="button"
                      className={styles.labOption}
                      onClick={() => handleLabAdd(lab)}
                    >
                      + {lab.nombre}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.allSelected}>✓ Todos los laboratorios creados han sido asignados</p>
              )}
            </div>

          </div>
        </div>

        {/* Columna Derecha: Tareas de la Actividad */}
        <div className={styles.rightCol}>
          <div className={styles.tasksHeader}>
            <span className={styles.tasksTitle}>Lista de Tareas / Checkpoints</span>
            {pendingCount > 0 && (
              <span className={styles.taskCount}>
                {pendingCount} definida{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Listado interactivo de tareas */}
          <div className={styles.taskList}>
            {tareas.map((tarea, idx) => {
              const isEmpty = tarea.trim() === '';
              const isLast  = idx === tareas.length - 1;
              return (
                <div key={idx} className={styles.taskRow}>
                  <div className={styles.taskNumber}>{idx + 1}</div>
                  <input
                    type="text"
                    className={`form-input ${styles.taskInput} ${isLast && isEmpty ? styles.taskInputEmpty : ''}`}
                    placeholder={isLast && isEmpty ? 'Escribe una nueva tarea...' : `Ej: Verificar encendido de PCs`}
                    value={tarea}
                    onChange={e => handleTareaChange(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    className={`${styles.taskDeleteBtn} ${isEmpty ? styles.taskDeleteHidden : ''}`}
                    onClick={() => handleTareaDelete(idx)}
                    tabIndex={-1}
                    title="Eliminar tarea"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
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
