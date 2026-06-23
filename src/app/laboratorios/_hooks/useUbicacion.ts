import { useState, useEffect, useCallback } from 'react';
import { getUbicacionInstitucion, saveUbicacionInstitucion, type UbicacionInstitucion } from '@/lib/api/laboratorio';

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<UbicacionInstitucion>({ lat: -17.783, lng: -63.182, radio: 100 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUbicacionInstitucion();
      setUbicacion(data);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar la ubicación de la institución.');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = async (payload: UbicacionInstitucion) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await saveUbicacionInstitucion(payload);
      setUbicacion(data);
      setSuccess(true);
      return data;
    } catch (err: any) {
      console.error(err);
      setError('Error al guardar la ubicación de la institución.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    ubicacion,
    loading,
    saving,
    error,
    success,
    setSuccess,
    guardar,
    recargar: cargar
  };
}
