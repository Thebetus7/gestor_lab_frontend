/**
 * lib/api/reserva.ts
 * Funciones de API y tipos para el módulo de Reservas.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

// ───── Tipos ─────────────────────────────────────────────────────────────────

export interface Reserva {
  id: number;
  laboratorio: number;
  laboratorio_nombre: string;
  docente_nombre: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  motivo: string | null;
  id_aux: number | null;
  auxiliar_username: string | null;
}

export interface CreateReservaPayload {
  laboratorio: number;
  docente_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}

export interface Docente {
  id: number;
  nombre: string;
}

export interface ReservaHorarioSimplificada {
  id: number;
  docente: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
}

export interface EspacioEstado {
  id: number;
  nombre: string;
  capacidad: string | null;
  estado: 'libre' | 'parcial';
  reservas: ReservaHorarioSimplificada[];
}

// ───── Reservas ──────────────────────────────────────────────────────────────

export const getReservas = () =>
  apiGet<Reserva[]>('/reserva/reservas/');

export const getReservaDetail = (id: number) =>
  apiGet<Reserva>(`/reserva/reservas/${id}/`);

export const createReserva = (payload: CreateReservaPayload) =>
  apiPost<Reserva>('/reserva/reservas/', payload);

export const updateReserva = (id: number, payload: CreateReservaPayload) =>
  apiPatch<Reserva>(`/reserva/reservas/${id}/`, payload);

export const deleteReserva = (id: number) =>
  apiDelete(`/reserva/reservas/${id}/`);

// ───── Disponibilidad ─────────────────────────────────────────────────────────

export const getEstadoEspacios = (fecha: string) =>
  apiGet<EspacioEstado[]>(`/reserva/reservas/estado-espacios/?fecha=${fecha}`);

// ───── Docentes sugeridos ────────────────────────────────────────────────────

export const getDocentes = () =>
  apiGet<Docente[]>('/reserva/docentes/');

export const deleteDocente = (id: number) =>
  apiDelete(`/reserva/docentes/${id}/`);
