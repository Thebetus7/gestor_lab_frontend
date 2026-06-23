import { useState, useEffect, useCallback } from 'react';
import { 
  getReservas, 
  createReserva, 
  updateReserva, 
  deleteReserva, 
  getDocentes, 
  deleteDocente, 
  getEstadoEspacios,
  type Reserva,
  type CreateReservaPayload,
  type Docente,
  type EspacioEstado
} from '@/lib/api/reserva';

export function useReservas(fechaSeleccionadaStr?: string) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [estadoEspacios, setEstadoEspacios] = useState<EspacioEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar reservas generales
  const cargarReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReservas();
      setReservas(data);
    } catch (err: any) {
      console.error('Error cargando reservas:', err);
      setError('No se pudieron cargar las reservas del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar docentes sugeridos
  const cargarDocentes = useCallback(async () => {
    try {
      const data = await getDocentes();
      setDocentes(data);
    } catch (err) {
      console.error('Error cargando docentes sugeridos:', err);
    }
  }, []);

  // Cargar disponibilidad de espacios para una fecha específica
  const cargarDisponibilidad = useCallback(async (fecha: string) => {
    try {
      const data = await getEstadoEspacios(fecha);
      setEstadoEspacios(data);
    } catch (err) {
      console.error('Error cargando estado de espacios:', err);
    }
  }, []);

  // Crear una reserva
  const crear = async (payload: CreateReservaPayload) => {
    setLoading(true);
    setError(null);
    try {
      await createReserva(payload);
      await cargarReservas();
      await cargarDocentes();
      if (fechaSeleccionadaStr) {
        await cargarDisponibilidad(fechaSeleccionadaStr);
      }
      return true;
    } catch (err: any) {
      console.error('Error creando reserva:', err);
      // Extraer mensaje del backend si existe
      let msg = 'Error al crear la reserva.';
      try {
        const errObj = JSON.parse(err.message);
        if (errObj.detail) msg = errObj.detail;
        else if (typeof errObj === 'object') {
          const firstVal = Object.values(errObj)[0];
          if (Array.isArray(firstVal)) msg = firstVal[0];
          else if (typeof firstVal === 'string') msg = firstVal;
        }
      } catch {}
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Editar una reserva
  const editar = async (id: number, payload: CreateReservaPayload) => {
    setLoading(true);
    setError(null);
    try {
      await updateReserva(id, payload);
      await cargarReservas();
      await cargarDocentes();
      if (fechaSeleccionadaStr) {
        await cargarDisponibilidad(fechaSeleccionadaStr);
      }
      return true;
    } catch (err: any) {
      console.error('Error editando reserva:', err);
      let msg = 'Error al actualizar la reserva.';
      try {
        const errObj = JSON.parse(err.message);
        if (errObj.detail) msg = errObj.detail;
        else if (typeof errObj === 'object') {
          const firstVal = Object.values(errObj)[0];
          if (Array.isArray(firstVal)) msg = firstVal[0];
          else if (typeof firstVal === 'string') msg = firstVal;
        }
      } catch {}
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una reserva
  const eliminar = async (id: number) => {
    setError(null);
    try {
      await deleteReserva(id);
      setReservas(prev => prev.filter(r => r.id !== id));
      if (fechaSeleccionadaStr) {
        await cargarDisponibilidad(fechaSeleccionadaStr);
      }
      return true;
    } catch (err: any) {
      console.error('Error eliminando reserva:', err);
      setError('No se pudo eliminar la reserva.');
      return false;
    }
  };

  // Eliminar docente del catálogo de sugerencias
  const eliminarDocenteSugerido = async (id: number) => {
    try {
      await deleteDocente(id);
      setDocentes(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error eliminando docente sugerido:', err);
    }
  };

  // Efecto inicial
  useEffect(() => {
    cargarReservas();
    cargarDocentes();
  }, [cargarReservas, cargarDocentes]);

  // Efecto para la disponibilidad al cambiar de fecha
  useEffect(() => {
    if (fechaSeleccionadaStr) {
      cargarDisponibilidad(fechaSeleccionadaStr);
    }
  }, [fechaSeleccionadaStr, cargarDisponibilidad]);

  return {
    reservas,
    docentes,
    estadoEspacios,
    loading,
    error,
    setError,
    cargarReservas,
    cargarDocentes,
    cargarDisponibilidad,
    crear,
    editar,
    eliminar,
    eliminarDocenteSugerido
  };
}
