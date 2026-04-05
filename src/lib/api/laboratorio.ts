import { API_URL } from './auth';

/**
 * Obtener actividades
 */
export async function getActividades(token: string) {
  const res = await fetch(`${API_URL}/laboratorio/actividades/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener actividades');
  return res.json();
}

/**
 * Ver el detalle de una actividad (incluye sus tareas y estados)
 */
export async function getActividadDetail(token: string, id: number) {
  const res = await fetch(`${API_URL}/laboratorio/actividades/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener detalle de actividad');
  return res.json();
}

/**
 * Crear actividad con tareas (array de strings)
 */
export async function createActividad(token: string, payload: { descripcion?: string; tiempo?: string; tareas: string[] }) {
  const res = await fetch(`${API_URL}/laboratorio/actividades/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al crear actividad');
  return res.json();
}

/**
 * Soft delete de actividad
 */
export async function deleteActividad(token: string, id: number) {
  const res = await fetch(`${API_URL}/laboratorio/actividades/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al eliminar actividad');
}

/**
 * Actualizar estado u observación de una Tarea (ActividadTarea)
 */
export async function updateActividadTarea(token: string, id: number, payload: { estado?: string; observacion?: string }) {
  const res = await fetch(`${API_URL}/laboratorio/actividad-tareas/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
}
