import { useState, useCallback, useEffect } from 'react';
import { getLaboratorios, createLaboratorio, deleteLaboratorio, type Laboratorio, type CreateLaboratorioPayload } from '@/lib/api/laboratorio';

export function useLaboratorios() {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLaboratorios();
      setLaboratorios(data);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar laboratorios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (payload: CreateLaboratorioPayload) => {
    try {
      const nuevo = await createLaboratorio(payload);
      setLaboratorios(prev => [nuevo, ...prev]);
      return nuevo;
    } catch (err: any) {
      alert('Error al crear laboratorio.');
      throw err;
    }
  };

  const eliminar = async (id: number) => {
    try {
      await deleteLaboratorio(id);
      setLaboratorios(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert('Error al eliminar laboratorio.');
    }
  };

  return { laboratorios, loading, error, crear, eliminar, cargar };
}
