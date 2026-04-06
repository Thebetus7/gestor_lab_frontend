'use client';

import Modal from '@/components/ui/Modal';
import Badge, { estadoToVariant, estadoToLabel } from '@/components/ui/Badge';
import { type ActividadDetail } from '@/lib/api/laboratorio';
import styles from './ShowActividadModal.module.css';

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  actividad: ActividadDetail | null;
}

export default function ShowActividadModal({ isOpen, onClose, actividad }: Props) {
  if (!actividad) return null;

  const totalTareas    = actividad.actividad_tareas.length;
  const realizadas     = actividad.actividad_tareas.filter(t => t.estado === 'realizado').length;
  const conProblema    = actividad.actividad_tareas.filter(t => t.estado === 'problema').length;
  const enEspera       = totalTareas - realizadas - conProblema;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {/* Header del modal */}
      <div className={styles.header}>
        <span className={styles.tag}>Actividad #{actividad.id}</span>
        <h2 className={styles.title}>
          {actividad.descripcion || 'Sin descripción'}
        </h2>
      </div>

      {/* Resumen de estados */}
      {totalTareas > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{totalTareas}</span>
            <span className={styles.summaryLabel}>Total</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={`${styles.summaryNum} ${styles.numSuccess}`}>{realizadas}</span>
            <span className={styles.summaryLabel}>Realizadas</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={`${styles.summaryNum} ${styles.numWarning}`}>{enEspera}</span>
            <span className={styles.summaryLabel}>En Espera</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={`${styles.summaryNum} ${styles.numDanger}`}>{conProblema}</span>
            <span className={styles.summaryLabel}>Con Problema</span>
          </div>
        </div>
      )}

      <hr className="divider" />

      {/* Lista de tareas */}
      <div className={styles.tasksSection}>
        <span className={styles.tasksTitle}>Lista de Tareas</span>

        {totalTareas === 0 ? (
          <p className={styles.empty}>No hay tareas registradas en esta actividad.</p>
        ) : (
          <div className={styles.taskList}>
            {actividad.actividad_tareas.map(at => (
              <div
                key={at.id}
                className={`${styles.taskCard} ${styles[`estado_${at.estado}`]}`}
              >
                <div className={styles.taskCardTop}>
                  <span className={styles.taskName}>{at.tarea_descripcion}</span>
                  <Badge variant={estadoToVariant(at.estado)}>
                    {estadoToLabel(at.estado)}
                  </Badge>
                </div>
                {at.observacion && (
                  <p className={styles.observacion}>
                    <strong>Observación del auxiliar:</strong> {at.observacion}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
