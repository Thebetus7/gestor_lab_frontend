'use client';

import { useState } from 'react';
import { useLaboratorios } from './_hooks/useLaboratorios';
import LaboratoriosTable from './_components/LaboratoriosTable';
import LaboratorioModal from './_components/LaboratorioModal';
import UbicacionModal from './_components/UbicacionModal';
import AccesoriosGlobalModal from './_components/AccesoriosGlobalModal';
import PageHeader from '@/components/ui/PageHeader';
import { type CreateLaboratorioPayload, type Laboratorio } from '@/lib/api/laboratorio';

export default function LaboratoriosPage() {
  const { laboratorios, loading, error, crear, editar, eliminar } = useLaboratorios();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLaboratorio, setEditingLaboratorio] = useState<Laboratorio | null>(null);
  const [isUbicacionOpen, setIsUbicacionOpen] = useState(false);
  const [isAccesoriosOpen, setIsAccesoriosOpen] = useState(false);

  const handleSubmitLaboratorio = async (payload: CreateLaboratorioPayload) => {
    if (editingLaboratorio) {
      await editar(editingLaboratorio.id, payload);
    } else {
      await crear(payload);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este laboratorio?')) return;
    await eliminar(id);
  };

  const handleEditClick = (lab: Laboratorio) => {
    setEditingLaboratorio(lab);
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingLaboratorio(null);
  };

  return (
    <div className="container">
      <PageHeader
        tag="Gestión"
        title="Laboratorios"
        subtitle="Registro de laboratorios y distribución de máquinas"
        action={
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button className="btn btn-secondary" onClick={() => setIsAccesoriosOpen(true)}>
              🧩 Añadir Accesorios
            </button>
            <button className="btn btn-secondary" onClick={() => setIsUbicacionOpen(true)}>
              📍 Configurar Ubicación
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setEditingLaboratorio(null);
                setIsCreateOpen(true);
              }}
            >
              + Nuevo Laboratorio
            </button>
          </div>
        }
      />

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--on-surface-variant)' }}>
            Cargando laboratorios...
          </p>
        ) : (
          <LaboratoriosTable
            laboratorios={laboratorios}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        )}
      </div>

      <LaboratorioModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitLaboratorio}
        laboratorio={editingLaboratorio}
      />

      <UbicacionModal
        isOpen={isUbicacionOpen}
        onClose={() => setIsUbicacionOpen(false)}
      />

      <AccesoriosGlobalModal
        isOpen={isAccesoriosOpen}
        onClose={() => setIsAccesoriosOpen(false)}
      />
    </div>
  );
}

