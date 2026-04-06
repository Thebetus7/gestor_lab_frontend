/**
 * api-client.ts
 * Core centralizado de conexiones HTTP para GestorLab.
 * Todas las llamadas al backend deben pasar por aquí.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Lee el access_token de las cookies del browser */
function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith('access_token='));
  return match ? match.split('=')[1] : null;
}

/** Cabeceras base para solicitudes autenticadas */
function buildHeaders(includeJson = false): HeadersInit {
  const token = getTokenFromCookies();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/** Verifica la respuesta y lanza error legible si falla */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      message = JSON.stringify(body);
    } catch {}
    throw new Error(message);
  }
  // Para DELETE 204 sin cuerpo
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** GET autenticado */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(),
  });
  return handleResponse<T>(res);
}

/** POST autenticado con body JSON */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** PATCH autenticado con body JSON (actualización parcial) */
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** DELETE autenticado */
export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse<void>(res);
}
