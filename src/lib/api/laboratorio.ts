/**
 * lib/api/laboratorio.ts
 * Funciones de API para el módulo de Laboratorio.
 * Usa el api-client centralizado (sin manejar tokens manualmente).
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

// ───── Tipos ─────────────────────────────────────────────────────────────────

export interface Accesorio {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface ActividadTarea {
  id: number;
  id_activ: number;
  id_tarea: number;
  tarea_descripcion: string;
  observacion: string | null;
  estado: 'espera' | 'realizado' | 'problema';
}

export interface ActividadList {
  id: number;
  descripcion: string | null;
  is_active: boolean;
}

export interface ActividadLaboratorio {
  id: number;
  nombre: string;
}

export interface ActividadDetail extends ActividadList {
  actividad_tareas: ActividadTarea[];
  laboratorios?: ActividadLaboratorio[];
}

export interface CreateActividadPayload {
  descripcion?: string;
  tareas: string[];
  laboratorios?: number[];
}

export interface Incidencia {
  id: number;
  descripcion: string | null;
  prioridad: string | null;
  id_lab: number | null;
  nombre_lab: string | null;
  resuelto: boolean;
  id_user: number | null;
  username_usuario: string | null;
  id_accesorio: number | null;
  nombre_accesorio: string | null;
}

// ───── Accesorios ───────────────────────────────────────────────────────────

export const getAccesorios = () =>
  apiGet<Accesorio[]>('/laboratorio/accesorios/');

export const createAccesorio = (payload: { nombre: string; descripcion?: string }) =>
  apiPost<Accesorio>('/laboratorio/accesorios/', payload);

export const deleteAccesorio = (id: number) =>
  apiDelete(`/laboratorio/accesorios/${id}/`);

// ───── Actividades ───────────────────────────────────────────────────────────

export const getActividades = () =>
  apiGet<ActividadList[]>('/actividad/actividades/');

export const getActividadDetail = (id: number) =>
  apiGet<ActividadDetail>(`/actividad/actividades/${id}/`);

export const createActividad = (payload: CreateActividadPayload) =>
  apiPost<ActividadDetail>('/actividad/actividades/', payload);

export const deleteActividad = (id: number) =>
  apiDelete(`/actividad/actividades/${id}/`);

// ───── Tareas (ActividadTarea) ───────────────────────────────────────────────

export const updateActividadTarea = (
  id: number,
  payload: { estado?: string; observacion?: string }
) => apiPatch<ActividadTarea>(`/actividad/actividad-tareas/${id}/`, payload);

// ───── Laboratorios ──────────────────────────────────────────────────────────

export interface Laboratorio {
  id: number;
  nombre: string | null;
  capacidad: string | null;
  filas: number;
  columnas: number;
  maquinas_count: number;
  accesorios?: Accesorio[];
}

export interface CreateLaboratorioPayload {
  nombre?: string;
  capacidad?: string;
  filas: number;
  columnas: number;
  maquinas_count: number;
  accesorios_ids?: number[];
}

export const getLaboratorios = () =>
  apiGet<Laboratorio[]>('/laboratorio/laboratorios/');

export const getLaboratorioDetail = (id: number) =>
  apiGet<Laboratorio>(`/laboratorio/laboratorios/${id}/`);

export const createLaboratorio = (payload: CreateLaboratorioPayload) =>
  apiPost<Laboratorio>('/laboratorio/laboratorios/', payload);

export const updateLaboratorio = (id: number, payload: CreateLaboratorioPayload) =>
  apiPatch<Laboratorio>(`/laboratorio/laboratorios/${id}/`, payload);

export const deleteLaboratorio = (id: number) =>
  apiDelete(`/laboratorio/laboratorios/${id}/`);

// ───── Ubicación de la Institución ───────────────────────────────────────────

export interface UbicacionInstitucion {
  id?: number;
  lat: number;
  lng: number;
  radio: number;
}

export const getUbicacionInstitucion = () =>
  apiGet<UbicacionInstitucion>('/laboratorio/ubicacion/');

export const saveUbicacionInstitucion = (payload: UbicacionInstitucion) =>
  apiPost<UbicacionInstitucion>('/laboratorio/ubicacion/', payload);

// ───── Incidencias ───────────────────────────────────────────────────────────

export const getIncidencias = () =>
  apiGet<Incidencia[]>('/actividad/incidencias/');

export const resolverIncidencia = (id: number, resuelto: boolean) =>
  apiPatch<Incidencia>(`/actividad/incidencias/${id}/`, { resuelto });


