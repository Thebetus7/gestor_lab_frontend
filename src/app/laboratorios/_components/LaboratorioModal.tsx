'use client';

import { useState, useEffect } from 'react';
import { type CreateLaboratorioPayload, type Laboratorio, type Accesorio, getAccesorios } from '@/lib/api/laboratorio';
import styles from './LaboratorioModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLaboratorioPayload) => Promise<void>;
  laboratorio?: Laboratorio | null;
}

// Icono de Monitor SVG representativo de una PC de escritorio
const MonitorIcon = () => (
  <svg 
    width="20" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={styles.monitorSvg}
  >
    <rect x="2" y="3" width="20" height="13" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="16" x2="12" y2="21" />
  </svg>
);

// Dibujo de arco arquitectónico de una puerta abierta
const DoorArch = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 32 32" 
    fill="none" 
    stroke="var(--accent)" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Puerta abierta en 90 grados */}
    <line x1="8" y1="24" x2="8" y2="8" />
    {/* Arco de apertura */}
    <path d="M 8 8 A 16 16 0 0 1 24 24" strokeDasharray="3,3" />
  </svg>
);

export default function LaboratorioModal({ isOpen, onClose, onSubmit, laboratorio }: Props) {
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [maquinasCount, setMaquinasCount] = useState<number | ''>('');
  const [filas, setFilas] = useState<number | ''>('');
  const [columnas, setColumnas] = useState<number | ''>('');
  
  // Accesorios
  const [catalogoAccesorios, setCatalogoAccesorios] = useState<Accesorio[]>([]);
  const [selectedAccesorios, setSelectedAccesorios] = useState<number[]>([]);

  // Posición de la puerta: 12 posiciones posibles (recorrido horario de las 4 paredes y sus 3 subdivisiones)
  const [doorPosition, setDoorPosition] = useState<string>('bottom-center');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sincronizar estados del formulario con el laboratorio a editar si existe
  useEffect(() => {
    if (isOpen) {
      // Cargar catálogo global de accesorios
      getAccesorios().then(setCatalogoAccesorios).catch(console.error);

      if (laboratorio) {
        setNombre(laboratorio.nombre || '');
        setCapacidad(laboratorio.capacidad || '');
        setMaquinasCount(laboratorio.maquinas_count);
        setFilas(laboratorio.filas);
        setColumnas(laboratorio.columnas);
        setSelectedAccesorios(laboratorio.accesorios?.map(a => a.id) || []);
      } else {
        setNombre('');
        setCapacidad('');
        setMaquinasCount('');
        setFilas('');
        setColumnas('');
        setSelectedAccesorios([]);
      }
    }
  }, [isOpen, laboratorio]);

  const toggleAccesorio = (id: number) => {
    setSelectedAccesorios(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Inicializar filas y columnas balanceadas en base a la cantidad de máquinas
  const handleMaquinasChange = (val: number | '') => {
    setMaquinasCount(val);
    setSuccessMsg('');
    if (typeof val === 'number' && val > 0) {
      const c = Math.ceil(Math.sqrt(val));
      const f = Math.ceil(val / c);
      setFilas(f);
      setColumnas(c);
    } else {
      setFilas('');
      setColumnas('');
    }
  };

  // Modificación interactiva de filas recalculando columnas
  const handleFilasChange = (val: number | '') => {
    setFilas(val);
    setSuccessMsg('');
    if (typeof val === 'number' && val > 0 && typeof maquinasCount === 'number' && maquinasCount > 0) {
      const c = Math.ceil(maquinasCount / val);
      setColumnas(c);
    }
  };

  // Modificación interactiva de columnas recalculando filas
  const handleColumnasChange = (val: number | '') => {
    setColumnas(val);
    setSuccessMsg('');
    if (typeof val === 'number' && val > 0 && typeof maquinasCount === 'number' && maquinasCount > 0) {
      const f = Math.ceil(maquinasCount / val);
      setFilas(f);
    }
  };

  // Botones rápidos de ajuste para filas
  const adjustFilas = (amount: number) => {
    const current = Number(filas) || 1;
    const newVal = Math.max(1, current + amount);
    handleFilasChange(newVal);
  };

  // Botones rápidos de ajuste para columnas
  const adjustColumnas = (amount: number) => {
    const current = Number(columnas) || 1;
    const newVal = Math.max(1, current + amount);
    handleColumnasChange(newVal);
  };

  // Array del recorrido horario de las posiciones de la puerta
  const doorPositionsOrder = [
    'top-start', 'top-center', 'top-end',
    'right-start', 'right-center', 'right-end',
    'bottom-end', 'bottom-center', 'bottom-start',
    'left-end', 'left-center', 'left-start'
  ];

  // Rotar cíclicamente la posición de la puerta (recorrer las paredes y sus extremos)
  const cycleDoorPosition = () => {
    setDoorPosition((prev) => {
      const currentIndex = doorPositionsOrder.indexOf(prev);
      const nextIndex = (currentIndex + 1) % doorPositionsOrder.length;
      return doorPositionsOrder[nextIndex];
    });
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
        accesorios_ids: selectedAccesorios,
      });
      setSuccessMsg(`¡El laboratorio "${nombre}" se creó correctamente!`);
      setNombre('');
      setCapacidad('');
      setMaquinasCount('');
      setFilas('');
      setColumnas('');
      setSelectedAccesorios([]);
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
    setDoorPosition('bottom-center');
    onClose();
  };

  const f = Number(filas) || 0;
  const c = Number(columnas) || 0;
  const mc = Number(maquinasCount) || 0;

  // Renderizar la cuadrícula del laboratorio con pasillo central vacío
  const middleCol = Math.floor(c / 2);
  const gridItems = [];

  if (f > 0 && c > 0) {
    for (let r = 0; r < f; r++) {
      for (let col = 0; col <= c; col++) {
        if (col === middleCol) {
          // Celda del pasillo vacío
          gridItems.push(
            <div key={`aisle-${r}-${col}`} className={styles.aisleCell} title="Pasillo Central" />
          );
        } else {
          // Celda de computadoras o ranuras libres
          const actualCol = col < middleCol ? col : col - 1;
          const pcIndex = r * c + actualCol;

          if (pcIndex < mc) {
            gridItems.push(
              <div key={`pc-${pcIndex}`} className={styles.pcIcon} title={`Máquina ${pcIndex + 1}`}>
                <MonitorIcon />
                <span className={styles.pcNum}>{pcIndex + 1}</span>
              </div>
            );
          } else {
            gridItems.push(
              <div key={`empty-${pcIndex}`} className={styles.emptySlot} title="Mesa de Trabajo Vacía">
                <span className={styles.pcNumSlot}>{pcIndex + 1}</span>
              </div>
            );
          }
        }
      }
    }
  }

  // Obtener la clase del contenedor de la puerta correspondiente
  const getDoorClass = () => {
    switch (doorPosition) {
      case 'top-start': return styles.doorTopStart;
      case 'top-center': return styles.doorTopCenter;
      case 'top-end': return styles.doorTopEnd;
      case 'right-start': return styles.doorRightStart;
      case 'right-center': return styles.doorRightCenter;
      case 'right-end': return styles.doorRightEnd;
      case 'bottom-end': return styles.doorBottomEnd;
      case 'bottom-center': return styles.doorBottomCenter;
      case 'bottom-start': return styles.doorBottomStart;
      case 'left-end': return styles.doorLeftEnd;
      case 'left-center': return styles.doorLeftCenter;
      case 'left-start': return styles.doorLeftStart;
      default:
        return styles.doorBottomCenter;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{laboratorio ? 'Editar Laboratorio' : 'Registrar Laboratorio'}</h2>
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
            <label>Capacidad (Alumnos)</label>
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

          {catalogoAccesorios.length > 0 && (
            <div className={styles.formGroup}>
              <label>Accesorios (Equipamiento)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                {catalogoAccesorios.map(acc => (
                  <label key={acc.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--outline-variant)', cursor: 'pointer',
                    backgroundColor: selectedAccesorios.includes(acc.id) ? 'var(--primary-container)' : 'transparent',
                    color: selectedAccesorios.includes(acc.id) ? 'var(--on-primary-container)' : 'var(--on-surface)',
                    fontSize: '0.875rem', transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedAccesorios.includes(acc.id)}
                      onChange={() => toggleAccesorio(acc.id)}
                      style={{ display: 'none' }}
                    />
                    {acc.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.gridControls}>
            <div className={styles.controlGroup}>
              <label>Filas</label>
              <div className={styles.counterControl}>
                <button type="button" onClick={() => adjustFilas(-1)} disabled={f <= 1}>-</button>
                <input
                  type="number"
                  min="1"
                  value={filas}
                  onChange={e => handleFilasChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <button type="button" onClick={() => adjustFilas(1)}>+</button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label>Columnas</label>
              <div className={styles.counterControl}>
                <button type="button" onClick={() => adjustColumnas(-1)} disabled={c <= 1}>-</button>
                <input
                  type="number"
                  min="1"
                  value={columnas}
                  onChange={e => handleColumnasChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <button type="button" onClick={() => adjustColumnas(1)}>+</button>
              </div>
            </div>
          </div>

          {f > 0 && c > 0 && (
            <>
              <div className={styles.doorSelectorWrapper}>
                <label className={styles.doorLabel}>
                  Ubicación de la Puerta: <strong>{
                    doorPosition === 'top-start' ? 'Superior Izquierda' :
                    doorPosition === 'top-center' ? 'Superior Centro' :
                    doorPosition === 'top-end' ? 'Superior Derecha' :
                    doorPosition === 'right-start' ? 'Derecha Superior' :
                    doorPosition === 'right-center' ? 'Derecha Centro' :
                    doorPosition === 'right-end' ? 'Derecha Inferior' :
                    doorPosition === 'bottom-end' ? 'Inferior Derecha' :
                    doorPosition === 'bottom-center' ? 'Inferior Centro' :
                    doorPosition === 'bottom-start' ? 'Inferior Izquierda' :
                    doorPosition === 'left-end' ? 'Izquierda Inferior' :
                    doorPosition === 'left-center' ? 'Izquierda Centro' :
                    doorPosition === 'left-start' ? 'Izquierda Superior' : doorPosition
                  }</strong>
                </label>
                <button
                  type="button"
                  className={`${styles.doorBtn} ${styles.activeDoor}`}
                  onClick={cycleDoorPosition}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '10px 16px' }}
                >
                Rotar 
                </button>
              </div>



              <div className={styles.roomPreview}>
                <div className={styles.roomContainer}>
                  {/* Dibujo de la Puerta */}
                  <div className={`${styles.doorWrapper} ${getDoorClass()}`}>
                    <DoorArch />
                  </div>

                  {/* Cuadrícula de PCs con el pasillo central */}
                  <div 
                    className={styles.roomGrid} 
                    style={{ gridTemplateColumns: `repeat(${c + 1}, 1fr)` }}
                  >
                    {gridItems}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (laboratorio ? 'Guardar Cambios' : 'Guardar y Crear Otro')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
