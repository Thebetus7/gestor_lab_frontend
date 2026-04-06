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

  const totalTareas = actividad.actividad_tareas.length;
  const realizadas  = actividad.actividad_tareas.filter(t => t.estado === 'realizado').length;
  const conProblema = actividad.actividad_tareas.filter(t => t.estado === 'problema').length;
  const enEspera    = totalTareas - realizadas - conProblema;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg"
      footer={<button className="btn btn-secondary" onClick={onClose}>Cerrar</button>}
    >
      <div className={styles.header}>
        <span className={styles.tag}>Actividad #{actividad.id}</span>
        <h2 className={styles.title}>{actividad.descripcion || 'Sin descripción'}</h2>
      </div>

      {totalTareas > 0 && (
        <div className={styles.summary}>
          {[
            { num: totalTareas, label: 'Total', cls: '' },
            { num: realizadas,  label: 'Realizadas', cls: styles.numSuccess },
            { num: enEspera,    label: 'En Espera',  cls: styles.numWarning },
            { num: conProblema, label: 'Problema',   cls: styles.numDanger  },
          ].map(({ num, label, cls }) => (
            <div key={label} className={styles.summaryItem}>
              <span className={`${styles.summaryNum} ${cls}`}>{num}</span>
              <span className={styles.summaryLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <hr className="divider" />

      <div className={styles.tasksSection}>
        <span className={styles.tasksTitle}>Lista de Tareas</span>
        {totalTareas === 0 ? (
          <p className={styles.empty}>No hay tareas en esta actividad.</p>
        ) : (
          <div className={styles.taskList}>
            {actividad.actividad_tareas.map(at => (
              <div key={at.id} className={`${styles.taskCard} ${styles[`estado_${at.estado}`]}`}>
                <div className={styles.taskCardTop}>
                  <span className={styles.taskName}>{at.tarea_descripcion}</span>
                  <Badge variant={estadoToVariant(at.estado)}>{estadoToLabel(at.estado)}</Badge>
                </div>
                {at.observacion && (
                  <p className={styles.observacion}>
                    <strong>Observación:</strong> {at.observacion}
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
