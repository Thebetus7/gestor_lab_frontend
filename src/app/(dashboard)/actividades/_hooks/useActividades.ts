'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getActividades,
  getActividadDetail,
  createActividad,
  deleteActividad,
  updateActividadTarea,
  type ActividadList,
  type ActividadDetail,
  type CreateActividadPayload,
} from '@/lib/api/laboratorio';

export function useActividades() {
  const [actividades, setActividades] = useState<ActividadList[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActividades();
      setActividades(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const crear = async (payload: CreateActividadPayload): Promise<ActividadDetail> => {
    const created = await createActividad(payload);
    await fetchAll();
    return created;
  };

  const eliminar = async (id: number) => {
    await deleteActividad(id);
    await fetchAll();
  };

  const verDetalle = async (id: number): Promise<ActividadDetail> => {
    return getActividadDetail(id);
  };

  const actualizarTarea = async (
    actividadTareaId: number,
    patch: { estado?: string; observacion?: string }
  ) => {
    return updateActividadTarea(actividadTareaId, patch);
  };

  return {
    actividades,
    loading,
    error,
    refetch: fetchAll,
    crear,
    eliminar,
    verDetalle,
    actualizarTarea,
  };
}
