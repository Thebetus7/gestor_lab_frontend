import React, { useState, useMemo } from 'react';
import { type EspacioEstado } from '@/lib/api/reserva';

interface DisponibilidadProps {
  fechaStr: string;
  disponibilidad: EspacioEstado[];
  onNuevaReservaClick: (labId: number) => void;
  loading: boolean;
}

export default function DisponibilidadPanel({
  fechaStr,
  disponibilidad,
  onNuevaReservaClick,
  loading
}: DisponibilidadProps) {
  const [selectedLabId, setSelectedLabId] = useState<string>('todos');
  const [horaFiltroInicio, setHoraFiltroInicio] = useState<string>('');
  const [horaFiltroFin, setHoraFiltroFin] = useState<string>('');

  const formatearFechaLegible = (fStr: string) => {
    if (!fStr) return '';
    const partes = fStr.split('-');
    if (partes.length !== 3) return fStr;
    const date = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate dynamic hours based on filters
  const horasAMostrar = useMemo(() => {
    let startHour = 0; // Por defecto todo el día desde 00:00
    let endHour = 23;  // hasta 23:59

    if (horaFiltroInicio && horaFiltroFin) {
      const start = parseInt(horaFiltroInicio.split(':')[0], 10);
      const end = parseInt(horaFiltroFin.split(':')[0], 10);
      if (start <= end) {
        startHour = Math.max(0, start - 1);
        endHour = Math.min(23, end + 1);
      }
    } else if (horaFiltroInicio) {
      const start = parseInt(horaFiltroInicio.split(':')[0], 10);
      startHour = Math.max(0, start - 1);
    } else if (horaFiltroFin) {
      const end = parseInt(horaFiltroFin.split(':')[0], 10);
      endHour = Math.min(23, end + 1);
    }

    const horas = [];
    for (let i = startHour; i <= endHour; i++) {
      const val = i.toString().padStart(2, '0') + ':00';
      const ampm = i < 12 ? 'AM' : 'PM';
      const label = (i === 0 ? 12 : i > 12 ? i - 12 : i) + ' ' + ampm;
      horas.push({ label, value: val, hourNum: i });
    }
    return horas;
  }, [horaFiltroInicio, horaFiltroFin]);

  // Combine reservations
  const reservasAFiltrar = useMemo(() => {
    if (selectedLabId === 'todos') {
      return disponibilidad.flatMap(lab => 
        lab.reservas.map(res => ({ ...res, labNombre: lab.nombre, labId: lab.id }))
      );
    } else {
      const lab = disponibilidad.find(d => d.id.toString() === selectedLabId);
      if (!lab) return [];
      return lab.reservas.map(res => ({ ...res, labNombre: lab.nombre, labId: lab.id }));
    }
  }, [disponibilidad, selectedLabId]);

  const obtenerReservasEnHora = (horaNum: number) => {
    return reservasAFiltrar.filter(res => {
      const hIni = parseInt(res.hora_inicio.split(':')[0], 10);
      const hFin = parseInt(res.hora_fin.split(':')[0], 10);
      const mFin = parseInt(res.hora_fin.split(':')[1], 10);
      
      // Si empieza en esta hora
      if (hIni === horaNum) return true;
      // Si continúa en esta hora
      if (horaNum > hIni && horaNum < hFin) return true;
      // Si termina en esta hora pero con minutos > 0 (ej. 10:30 ocupa el bloque de las 10)
      if (horaNum === hFin && mFin > 0) return true;
      
      return false;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cabecera del Panel */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, color: 'var(--on-surface)', textTransform: 'capitalize' }}>
          {formatearFechaLegible(fechaStr)}
        </h3>
        <p style={{ margin: 'var(--sp-1) 0 0 0', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
          Agenda diaria y disponibilidad de espacios
        </p>
      </div>

      {/* Controles de Filtro */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
        padding: 'var(--sp-3)',
        background: 'var(--surface-container-low)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--outline-variant)',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--outline)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Laboratorio / Aula
          </label>
          <select 
            value={selectedLabId}
            onChange={(e) => setSelectedLabId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--bg-card)' }}
          >
            <option value="todos">Todas las aulas (Unificadas)</option>
            {disponibilidad.map(lab => (
              <option key={lab.id} value={lab.id.toString()}>{lab.nombre}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--outline)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Hora Inicial
          </label>
          <input 
            type="time" 
            value={horaFiltroInicio} 
            onChange={(e) => setHoraFiltroInicio(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--outline)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Hora Final
          </label>
          <input 
            type="time" 
            value={horaFiltroFin} 
            onChange={(e) => setHoraFiltroFin(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
          />
        </div>
        {(selectedLabId !== 'todos' || horaFiltroInicio !== '' || horaFiltroFin !== '') && (
          <div style={{ flex: '0 0 auto' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSelectedLabId('todos');
                setHoraFiltroInicio('');
                setHoraFiltroFin('');
              }}
              style={{
                height: '35px',
                padding: '0 16px',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Vista de Calendario por Hora en Vertical */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--outline)' }}>
            Cargando agenda...
          </p>
        ) : disponibilidad.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--sp-8)',
            color: 'var(--outline)',
            border: '1px dashed var(--surface-container-high)',
            borderRadius: 'var(--radius-lg)'
          }}>
            No hay laboratorios registrados en el sistema.
          </div>
        ) : (
          <div style={{
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)'
          }}>
            
            <div style={{
              background: 'var(--surface-container-low)',
              padding: '10px 16px',
              borderBottom: '1px solid var(--outline-variant)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                📋 Línea de Tiempo {selectedLabId !== 'todos' && `- ${disponibilidad.find(d => d.id.toString() === selectedLabId)?.nombre}`}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              {horasAMostrar.map((hora) => {
                const reservasEnEstaHora = obtenerReservasEnHora(hora.hourNum);
                
                return (
                  <div
                    key={hora.value}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      borderBottom: '1px solid var(--surface-container-high)',
                      minHeight: '80px',
                      position: 'relative'
                    }}
                    className="timeline-row"
                  >
                    {/* Barra de Hora (Izquierda) */}
                    <div style={{
                      width: '65px',
                      padding: '8px 10px 8px 8px',
                      borderRight: '1px solid var(--outline-variant)',
                      backgroundColor: 'var(--surface-container-lowest)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--outline)',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      userSelect: 'none'
                    }}>
                      {hora.label}
                    </div>

                    {/* Espacio del Evento (Derecha) */}
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '6px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        borderBottom: '1px dotted var(--surface-container-high)',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }} />

                      {reservasEnEstaHora.length > 0 ? (
                        reservasEnEstaHora.map((res, idx) => {
                          const hIniNum = parseInt(res.hora_inicio.split(':')[0], 10);
                          const esInicioDeReserva = hIniNum === hora.hourNum;

                          if (esInicioDeReserva) {
                            return (
                              <div key={`${res.id}-${idx}`} style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 140, 199, 0.08)',
                                border: '1.5px solid rgba(0, 140, 199, 0.3)',
                                borderLeft: '4px solid var(--accent)',
                                borderRadius: 'var(--radius-md)',
                                padding: '6px 12px',
                                zIndex: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                                    👤 {res.docente} {selectedLabId === 'todos' && <span style={{ color: 'var(--outline)', fontWeight: 500, fontSize: '0.75rem' }}> en {res.labNombre}</span>}
                                  </span>
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)', background: 'rgba(0, 140, 199, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {res.hora_inicio.substring(0, 5)} - {res.hora_fin.substring(0, 5)}
                                  </span>
                                </div>
                                {res.motivo && (
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--on-surface-variant)', 
                                    fontStyle: 'italic',
                                    marginTop: '2px',
                                  }}>
                                    "{res.motivo}"
                                  </span>
                                )}
                              </div>
                            );
                          } else {
                            // Bloque de continuación de la reserva
                            return (
                              <div key={`${res.id}-cont-${idx}`} style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 140, 199, 0.025)',
                                borderLeft: '4px solid var(--accent)',
                                opacity: 0.6,
                                zIndex: 2,
                                pointerEvents: 'none',
                                flex: 1,
                                minHeight: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '8px'
                              }}>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--outline)', fontStyle: 'italic' }}>
                                  (Continuación: {res.docente} - {res.labNombre})
                                </span>
                              </div>
                            );
                          }
                        })
                      ) : (
                        // Bloque libre
                        <div 
                          style={{
                            width: '100%',
                            flex: 1,
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '12px',
                            minHeight: '40px'
                          }}
                          className="cell-available"
                        >
                          <button
                            type="button"
                            onClick={() => onNuevaReservaClick(selectedLabId === 'todos' ? disponibilidad[0]?.id : parseInt(selectedLabId, 10))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent)',
                              fontSize: '1.25rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'none',
                              padding: '4px'
                            }}
                            className="cell-add-btn"
                            title="Reservar en este horario"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        )}
      </div>

      <style jsx global>{`
        .timeline-row:hover .cell-add-btn {
          display: block !important;
        }
        .timeline-row:hover {
          background-color: rgba(0,0,0,0.005);
        }
      `}</style>
    </div>
  );
}
