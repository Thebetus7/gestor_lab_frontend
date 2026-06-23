import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { type Reserva, type CreateReservaPayload, type Docente } from '@/lib/api/reserva';
import { type Laboratorio, getLaboratorios } from '@/lib/api/laboratorio';
import GestionDocentesPanel from './GestionDocentesPanel';

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReservaPayload) => Promise<boolean>;
  reserva: Reserva | null;
  docentes: Docente[];
  onDeleteDocente: (id: number) => void;
}

export default function ReservaModal({
  isOpen,
  onClose,
  onSubmit,
  reserva,
  docentes,
  onDeleteDocente
}: ReservaModalProps) {
  const [laboratorioId, setLaboratorioId] = useState<number | ''>('');
  const [docenteNombre, setDocenteNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [motivo, setMotivo] = useState('');

  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [showDocentesPanel, setShowDocentesPanel] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estados para el mini-calendario mensual
  const [calDate, setCalDate] = useState(new Date());

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const docentePanelRef = useRef<HTMLDivElement>(null);

  // Cargar laboratorios al montar
  useEffect(() => {
    getLaboratorios()
      .then(setLaboratorios)
      .catch(err => console.error('Error cargando laboratorios en modal:', err));
  }, []);

  // Rellenar formulario en caso de edición
  useEffect(() => {
    if (reserva) {
      setLaboratorioId(reserva.laboratorio);
      setDocenteNombre(reserva.docente_nombre);
      setFecha(reserva.fecha);
      setCalDate(new Date(reserva.fecha));
      // Truncar segundos si vienen del backend (HH:MM:SS -> HH:MM)
      const hIni = reserva.hora_inicio.substring(0, 5);
      const hFin = reserva.hora_fin.substring(0, 5);
      setHoraInicio(hIni);
      setHoraFin(hFin);
      setMotivo(reserva.motivo || '');
    } else {
      setLaboratorioId('');
      setDocenteNombre('');
      const hoyStr = new Date().toISOString().split('T')[0];
      setFecha(hoyStr);
      setCalDate(new Date());
      setHoraInicio('08:00');
      setHoraFin('10:00');
      setMotivo('');
    }
    setShowDocentesPanel(false);
    setShowSuggestions(false);
  }, [reserva, isOpen]);

  // Cerrar sugerencias al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (docentePanelRef.current && !docentePanelRef.current.contains(event.target as Node)) {
        // No cerrar si hicieron clic en el botón de toggle
        const target = event.target as HTMLElement;
        if (!target.closest('.toggle-docentes-btn')) {
          setShowDocentesPanel(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de sugerencias de autocompletado
  const sugerenciasFiltradas = docentes.filter(d => 
    d.nombre.toLowerCase().includes(docenteNombre.toLowerCase()) &&
    d.nombre.toLowerCase() !== docenteNombre.toLowerCase()
  );

  const handleSuggestionClick = (nombre: string) => {
    setDocenteNombre(nombre);
    setShowSuggestions(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laboratorioId || !docenteNombre.trim() || !fecha || !horaInicio || !horaFin) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const payload: CreateReservaPayload = {
      laboratorio: Number(laboratorioId),
      docente_nombre: docenteNombre.trim(),
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      motivo: motivo.trim() || undefined
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  // Lógica del mini-calendario
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0=Lun, 6=Dom
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const miniDaysArray: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    miniDaysArray.push({
      date: new Date(year, month - 1, prevMonthTotalDays - i),
      isCurrentMonth: false
    });
  }
  for (let i = 1; i <= totalDays; i++) {
    miniDaysArray.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  const totalCells = Math.ceil(miniDaysArray.length / 7) * 7;
  const nextMonthDaysNeeded = totalCells - miniDaysArray.length;
  for (let i = 1; i <= nextMonthDaysNeeded; i++) {
    miniDaysArray.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const handleMiniDaySelect = (d: Date) => {
    // Formatear local YYYY-MM-DD
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    setFecha(`${yStr}-${mStr}-${dStr}`);
  };

  const handlePrevCalMonth = () => {
    setCalDate(new Date(year, month - 1, 1));
  };
  const handleNextCalMonth = () => {
    setCalDate(new Date(year, month + 1, 1));
  };

  const NOMBRES_MESES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reserva ? '✏️ Editar Reserva' : '📅 Nueva Reserva de Espacio'}
      size="wide"
      footer={
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleFormSubmit}>
            {reserva ? 'Guardar Cambios' : 'Crear Reserva'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        
        {/* Layout de dos columnas */}
        <div className="grid-2-cols" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--sp-6)',
          alignItems: 'start'
        }}>
          
          {/* Columna Izquierda: Formulario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            
            {/* Laboratorio */}
            <div className="form-group">
              <label className="form-label">Laboratorio / Espacio *</label>
              <select
                className="form-input"
                value={laboratorioId}
                onChange={(e) => setLaboratorioId(e.target.value ? Number(e.target.value) : '')}
                required
                style={{ appearance: 'auto', padding: '0 var(--sp-3)', height: '40px' }}
              >
                <option value="">-- Seleccionar Laboratorio --</option>
                {laboratorios.map(lab => (
                  <option key={lab.id} value={lab.id}>
                    {lab.nombre} (Capacidad: {lab.capacidad || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Docente con Autocomplete y Popover al lado */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Docente / Responsable *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }} ref={suggestionsRef}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ingresa nombre de docente..."
                    value={docenteNombre}
                    onChange={(e) => {
                      setDocenteNombre(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    required
                    style={{ height: '40px' }}
                  />
                  {/* Sugerencias de Autocomplete */}
                  {showSuggestions && docenteNombre && sugerenciasFiltradas.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 1000,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      marginTop: '4px'
                    }}>
                      {sugerenciasFiltradas.map(d => (
                        <div
                          key={d.id}
                          onClick={() => handleSuggestionClick(d.nombre)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: 'var(--on-surface)',
                            transition: 'background 0.15s'
                          }}
                          className="suggestion-item"
                        >
                          👤 {d.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Botón para desplegar Gestión de Docentes sugeridos */}
                <button
                  type="button"
                  className="btn btn-secondary toggle-docentes-btn"
                  onClick={() => setShowDocentesPanel(!showDocentesPanel)}
                  title="Gestionar docentes sugeridos"
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: 'auto',
                    padding: 0,
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}
                >
                  👥
                </button>
              </div>

              {/* Panel adyacente de gestión de docentes (Popover flotante) */}
              <GestionDocentesPanel
                showPanel={showDocentesPanel}
                onClose={() => setShowDocentesPanel(false)}
                docentes={docentes}
                onSelectDocente={(nombre) => {
                  setDocenteNombre(nombre);
                  setShowDocentesPanel(false);
                }}
                onDeleteDocente={onDeleteDocente}
                panelRef={docentePanelRef}
              />
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label className="form-label">Fecha de Reserva *</label>
              <input
                type="date"
                className="form-input"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  if (e.target.value) {
                    setCalDate(new Date(e.target.value));
                  }
                }}
                required
                style={{ height: '40px' }}
              />
            </div>

            {/* Horas de inicio y fin */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              <div className="form-group">
                <label className="form-label">Hora Inicio *</label>
                <input
                  type="time"
                  className="form-input"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  style={{ height: '40px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora Fin *</label>
                <input
                  type="time"
                  className="form-input"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  required
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            {/* Motivo */}
            <div className="form-group">
              <label className="form-label">Motivo / Descripción</label>
              <textarea
                className="form-textarea"
                placeholder="Ingresa el motivo de la reserva o actividad de laboratorio..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                style={{ minHeight: '60px' }}
              />
            </div>

          </div>

          {/* Columna Derecha: Mini-Calendario para Selección de Fecha */}
          <div style={{
            borderLeft: '1px solid var(--surface-container-high)',
            paddingLeft: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)'
          }}>
            <span className="form-label" style={{ marginBottom: '2px', display: 'block' }}>
              📅 Seleccionar Fecha en el Calendario
            </span>

            {/* Mini Calendar Container */}
            <div style={{
              background: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--sp-3)',
              border: '1px solid var(--surface-container-high)'
            }}>
              
              {/* Header Mini Calendar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--sp-2)'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {NOMBRES_MESES[month]} {year}
                </span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handlePrevCalMonth}
                    style={{ padding: '2px 8px', height: '26px', fontSize: '0.75rem', minWidth: 'auto' }}
                  >
                    ←
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleNextCalMonth}
                    style={{ padding: '2px 8px', height: '26px', fontSize: '0.75rem', minWidth: 'auto' }}
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Días de la semana Mini */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.6875rem',
                color: 'var(--outline)',
                marginBottom: 'var(--sp-1)'
              }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* Cuadrícula Mini */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px'
              }}>
                {miniDaysArray.map((cell, idx) => {
                  // Comparar con la fecha seleccionada en input
                  let isSelected = false;
                  if (fecha) {
                    const partes = fecha.split('-');
                    if (partes.length === 3) {
                      const selDate = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
                      isSelected = 
                        cell.date.getDate() === selDate.getDate() &&
                        cell.date.getMonth() === selDate.getMonth() &&
                        cell.date.getFullYear() === selDate.getFullYear();
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMiniDaySelect(cell.date)}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected 
                          ? 'var(--primary)' 
                          : cell.isCurrentMonth 
                            ? 'transparent' 
                            : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: isSelected 
                          ? 'var(--on-primary)' 
                          : cell.isCurrentMonth 
                            ? 'var(--on-surface)' 
                            : 'var(--outline)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        opacity: cell.isCurrentMonth ? 1 : 0.4,
                        transition: 'all 0.15s'
                      }}
                      className="mini-day-btn"
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Indicación visual de fecha seleccionada */}
            <div style={{
              fontSize: '0.8125rem',
              color: 'var(--on-surface-variant)',
              textAlign: 'center',
              padding: '6px',
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500
            }}>
              Fecha elegida: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{fecha || 'Ninguna'}</span>
            </div>

          </div>

        </div>

      </form>
      
      {/* Estilos CSS locales */}
      <style jsx global>{`
        .suggestion-item:hover {
          background-color: var(--surface-container) !important;
        }
        .mini-day-btn:hover {
          background-color: var(--surface-container-high) !important;
        }
      `}</style>
    </Modal>
  );
}
