'use client';

import { useState } from 'react';
import { useLaboratorios } from './_hooks/useLaboratorios';
import LaboratoriosTable from './_components/LaboratoriosTable';
import LaboratorioModal from './_components/LaboratorioModal';
import PageHeader from '@/components/ui/PageHeader';
import { type CreateLaboratorioPayload } from '@/lib/api/laboratorio';

export default function LaboratoriosPage() {
  const { laboratorios, loading, error, crear, eliminar } = useLaboratorios();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (payload: CreateLaboratorioPayload) => {
    await crear(payload);
    // El mensaje de confirmación y el reset se manejan dentro del modal como pidió el usuario
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este laboratorio?')) return;
    await eliminar(id);
  };

  return (
    <div className="container">
      <PageHeader
        tag="Gestión"
        title="Laboratorios"
        subtitle="Registro de laboratorios y distribución de máquinas"
        action={
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            + Nuevo Laboratorio
          </button>
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
            onDelete={handleDelete}
          />
        )}
      </div>

      <LaboratorioModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
