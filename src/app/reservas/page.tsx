'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useReservas } from './_hooks/useReservas';
import CalendarioInteractivo from './_components/CalendarioInteractivo';
import DisponibilidadPanel from './_components/DisponibilidadPanel';
import ReservasTable from './_components/ReservasTable';
import ReservaModal from './_components/ReservaModal';
import { type Reserva } from '@/lib/api/reserva';

type VistaTipo = 'calendario' | 'gestion';

export default function ReservasPage() {
  const [vista, setVista] = useState<VistaTipo>('calendario');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);

  // Formatear fecha en string YYYY-MM-DD para pasárselo al hook y la API
  const yStr = fechaSeleccionada.getFullYear();
  const mStr = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
  const dStr = String(fechaSeleccionada.getDate()).padStart(2, '0');
  const fechaSeleccionadaStr = `${yStr}-${mStr}-${dStr}`;

  // Usar el hook personalizado de reservas
  const {
    reservas,
    docentes,
    estadoEspacios,
    loading,
    error,
    crear,
    editar,
    eliminar,
    eliminarDocenteSugerido
  } = useReservas(fechaSeleccionadaStr);

  const handleNuevaReserva = () => {
    setEditingReserva(null);
    setIsModalOpen(true);
  };

  const handleNuevaReservaParaLab = (labId: number) => {
    // Crear reserva rápida con laboratorio ya asignado
    setEditingReserva({
      id: 0,
      laboratorio: labId,
      laboratorio_nombre: '',
      docente_nombre: '',
      fecha: fechaSeleccionadaStr,
      hora_inicio: '08:00',
      hora_fin: '10:00',
      motivo: '',
      id_aux: null,
      auxiliar_username: null
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (res: Reserva) => {
    setEditingReserva(res);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) return;
    await eliminar(id);
  };

  const handleModalSubmit = async (payload: any) => {
    if (editingReserva && editingReserva.id !== 0) {
      return await editar(editingReserva.id, payload);
    } else {
      // También sirve para la reserva rápida (id = 0)
      return await crear(payload);
    }
  };

  return (
    <div className="container" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header del Módulo */}
      <PageHeader
        tag="Gestión"
        title="Reservas de Laboratorio"
        subtitle="Monitoreo de disponibilidad y asignación de espacios a docentes"
        action={
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleNuevaReserva}
          >
            + Nueva Reserva
          </button>
        }
      />

      {/* Switch de Vistas (Tabs) */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--surface-container-high)',
        marginBottom: 'var(--sp-6)',
        gap: 'var(--sp-4)'
      }}>
        <button
          type="button"
          onClick={() => setVista('calendario')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: vista === 'calendario' ? '2.5px solid var(--on-surface)' : '2.5px solid transparent',
            padding: '12px 16px',
            fontSize: '0.9375rem',
            fontWeight: vista === 'calendario' ? 700 : 500,
            color: vista === 'calendario' ? 'var(--on-surface)' : 'var(--outline)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-1px'
          }}
        >
        Calendario
        </button>
        <button
          type="button"
          onClick={() => setVista('gestion')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: vista === 'gestion' ? '2.5px solid var(--on-surface)' : '2.5px solid transparent',
            padding: '12px 16px',
            fontSize: '0.9375rem',
            fontWeight: vista === 'gestion' ? 700 : 500,
            color: vista === 'gestion' ? 'var(--on-surface)' : 'var(--outline)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-1px'
          }}
        >
        Registros
        </button>
      </div>

      {/* Alertas de error del backend */}
      {error && (
        <div style={{
          background: 'rgba(186, 26, 26, 0.08)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          padding: 'var(--sp-4)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--sp-4)',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button 
            type="button" 
            onClick={() => error.includes('conectar al servidor') ? useReservas() : error} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Renderizado de la Vista Seleccionada */}
      {vista === 'calendario' ? (
        
        /* Vista 1: Calendario e Información Lateral (Grid) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '5fr 7fr',
          gap: 'var(--sp-6)',
          alignItems: 'start'
        }} className="reservas-grid">
          
          {/* Columna Izquierda: Calendario interactivo */}
          <div className="card" style={{ padding: 'var(--sp-2)' }}>
            <CalendarioInteractivo
              fechaSeleccionada={fechaSeleccionada}
              onFechaSelect={setFechaSeleccionada}
              reservas={reservas}
            />
          </div>

          {/* Columna Derecha: Panel de disponibilidad y estado diario */}
          <div className="card" style={{ padding: 'var(--sp-6)', minHeight: '350px' }}>
            <DisponibilidadPanel
              fechaStr={fechaSeleccionadaStr}
              disponibilidad={estadoEspacios}
              onNuevaReservaClick={handleNuevaReservaParaLab}
              loading={loading}
            />
          </div>

        </div>

      ) : (

        /* Vista 2: Gestión CRUD / Tabla General */
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 'var(--sp-4)', color: 'var(--on-surface)' }}>
            Listado Histórico de Reservas
          </h3>
          <ReservasTable
            reservas={reservas}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>

      )}

      {/* Modal del Formulario */}
      <ReservaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReserva(null);
        }}
        onSubmit={handleModalSubmit}
        reserva={editingReserva}
        docentes={docentes}
        onDeleteDocente={eliminarDocenteSugerido}
      />
      
      {/* Media Queries Responsivos */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .reservas-grid {
            grid-templateColumns: 1fr !important;
            gap: var(--sp-4) !important;
          }
        }
      `}</style>

    </div>
  );
}
