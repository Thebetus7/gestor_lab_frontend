/**
 * lib/api/laboratorio.ts
 * Funciones de API para el módulo de Laboratorio.
 * Usa el api-client centralizado (sin manejar tokens manualmente).
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

// ───── Tipos ─────────────────────────────────────────────────────────────────

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

export interface ActividadDetail extends ActividadList {
  actividad_tareas: ActividadTarea[];
}

export interface CreateActividadPayload {
  descripcion?: string;
  tareas: string[];
  laboratorios?: number[];
}

// ───── Actividades ───────────────────────────────────────────────────────────

export const getActividades = () =>
  apiGet<ActividadList[]>('/laboratorio/actividades/');

export const getActividadDetail = (id: number) =>
  apiGet<ActividadDetail>(`/laboratorio/actividades/${id}/`);

export const createActividad = (payload: CreateActividadPayload) =>
  apiPost<ActividadDetail>('/laboratorio/actividades/', payload);

export const deleteActividad = (id: number) =>
  apiDelete(`/laboratorio/actividades/${id}/`);

// ───── Tareas (ActividadTarea) ───────────────────────────────────────────────

export const updateActividadTarea = (
  id: number,
  payload: { estado?: string; observacion?: string }
) => apiPatch<ActividadTarea>(`/laboratorio/actividad-tareas/${id}/`, payload);
