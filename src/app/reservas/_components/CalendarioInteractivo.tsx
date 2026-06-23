import React, { useState } from 'react';
import { type Reserva } from '@/lib/api/reserva';

interface CalendarioProps {
  fechaSeleccionada: Date;
  onFechaSelect: (date: Date) => void;
  reservas: Reserva[];
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarioInteractivo({
  fechaSeleccionada,
  onFechaSelect,
  reservas
}: CalendarioProps) {
  const [currentDate, setCurrentDate] = useState(new Date(fechaSeleccionada));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primer día del mes (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Convertir a index donde 0 = Lunes, 6 = Domingo
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Días totales del mes actual
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Días totales del mes anterior
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Días para renderizar
  const daysArray: { date: Date; isCurrentMonth: boolean }[] = [];

  // Rellenar días del mes anterior
  for (let i = startOffset - 1; i >= 0; i--) {
    daysArray.push({
      date: new Date(year, month - 1, prevMonthTotalDays - i),
      isCurrentMonth: false
    });
  }

  // Rellenar días del mes actual
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // Rellenar días del mes siguiente para completar la cuadrícula (múltiplo de 7)
  const totalCells = Math.ceil(daysArray.length / 7) * 7;
  const nextMonthDaysNeeded = totalCells - daysArray.length;
  for (let i = 1; i <= nextMonthDaysNeeded; i++) {
    daysArray.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    onFechaSelect(date);
    // Si el día clicado es de otro mes, actualizar el mes actual en vista
    if (date.getMonth() !== month) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  // Helper para verificar si un día tiene reservas
  const tieneReservas = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservas.some(r => r.fecha === dateStr);
  };

  // Helper para comparar si es la misma fecha
  const esMismaFecha = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const esHoy = (date: Date) => {
    const hoy = new Date();
    return esMismaFecha(date, hoy);
  };

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      {/* Header del Calendario */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--sp-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--on-surface)' }}>
            {NOMBRES_MESES[month]} {year}
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const hoy = new Date();
              onFechaSelect(hoy);
              setCurrentDate(hoy);
            }}
            style={{
              padding: '6px 12px',
              height: '36px',
              minWidth: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: 'var(--surface-container-high)',
              border: '1px solid var(--outline-variant)'
            }}
          >
            📅 Hoy
          </button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handlePrevMonth}
            style={{ padding: '4px 12px', height: '36px', minWidth: 'auto' }}
          >
            ←
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleNextMonth}
            style={{ padding: '4px 12px', height: '36px', minWidth: 'auto' }}
          >
            →
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '0.75rem',
        color: 'var(--outline)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 'var(--sp-2)'
      }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ padding: 'var(--sp-1)' }}>{d}</div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {daysArray.map((cell, index) => {
          const isSelected = esMismaFecha(cell.date, fechaSeleccionada);
          const isToday = esHoy(cell.date);
          const hasReservas = tieneReservas(cell.date);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDayClick(cell.date)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected 
                  ? 'var(--primary)' 
                  : isToday
                    ? 'rgba(0, 140, 199, 0.15)' // Fondo accent suave pero notorio
                    : cell.isCurrentMonth 
                      ? 'var(--surface-container-low)' 
                      : 'transparent',
                border: isToday
                  ? '2px solid var(--accent)' // Borde fuerte siempre para hoy
                  : 'none',
                borderRadius: 'var(--radius-md)',
                color: isSelected 
                  ? 'var(--on-primary)' 
                  : isToday
                    ? 'var(--accent)' // Letra color accent fuerte
                    : cell.isCurrentMonth 
                      ? 'var(--on-surface)' 
                      : 'var(--outline)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected || isToday ? '800' : '500',
                opacity: cell.isCurrentMonth ? 1 : 0.5,
                transition: 'all 0.2s ease',
                boxShadow: isToday && !isSelected ? '0 0 10px rgba(0, 140, 199, 0.2)' : 'none', // Sombra brillante para hoy
              }}
              className={`calendar-day-btn ${isToday ? 'today-btn' : ''}`}
            >
              <span>{cell.date.getDate()}</span>
              {hasReservas && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isSelected ? 'var(--on-primary)' : isToday ? 'var(--accent)' : 'var(--primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Estilos locales para hover */}
      <style jsx global>{`
        .calendar-day-btn:hover {
          background-color: var(--surface-container-high) !important;
          transform: scale(1.05);
        }
        .calendar-day-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
