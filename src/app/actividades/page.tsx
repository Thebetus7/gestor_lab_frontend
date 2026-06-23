'use client';

import { useState } from 'react';
import { useActividades } from './_hooks/useActividades';
import ActividadesTable from './_components/ActividadesTable';
import CreateActividadModal from './_components/CreateActividadModal';
import ShowActividadModal from './_components/ShowActividadModal';
import PageHeader from '@/components/ui/PageHeader';
import { type ActividadDetail, type CreateActividadPayload } from '@/lib/api/laboratorio';

export default function ActividadesPage() {
  const { actividades, loading, error, crear, eliminar, verDetalle } = useActividades();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShowOpen, setIsShowOpen]     = useState(false);
  const [detalle, setDetalle]           = useState<ActividadDetail | null>(null);

  const handleCreate = async (payload: CreateActividadPayload) => {
    await crear(payload);
    setIsCreateOpen(false);
  };

  const handleShow = async (id: number) => {
    const data = await verDetalle(id);
    setDetalle(data);
    setIsShowOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    await eliminar(id);
  };

  return (
    <div className="container">
      <PageHeader
        tag="Gestión"
        title="Actividades"
        subtitle="Registro de actividades y sus tareas de verificación"
        action={
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            + Nueva Actividad
          </button>
        }
      />

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--on-surface-variant)' }}>
            Cargando actividades...
          </p>
        ) : (
          <ActividadesTable
            actividades={actividades}
            onShow={handleShow}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CreateActividadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ShowActividadModal
        isOpen={isShowOpen}
        onClose={() => setIsShowOpen(false)}
        actividad={detalle}
      />
    </div>
  );
}
