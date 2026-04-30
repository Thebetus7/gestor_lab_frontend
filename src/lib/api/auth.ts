/**
 * lib/api/auth.ts
 * Funciones de autenticación.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/usuarios/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    // Si la respuesta no es OK, intentamos extraer el mensaje de error del backend
    try {
      const errorData = await res.json();
      // Lanzamos un error que contenga el campo 'detail' enviado por Django
      const error = new Error(errorData.detail || 'Error de autenticación');
      (error as any).detail = errorData.detail;
      (error as any).status = res.status;
      throw error;
    } catch (e) {
      if (e instanceof Error && (e as any).detail) throw e;
      throw new Error('No se pudo procesar la respuesta del servidor');
    }
  }

  return res.json();
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/usuarios/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      // Si el error es un objeto con arrays de strings (ej. validaciones de DRF)
      let errorMessage = 'Error al registrar usuario';
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && Array.isArray(errorData[firstKey])) {
          errorMessage = errorData[firstKey][0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    } catch (e) {
      if (e instanceof Error && e.message !== 'No se pudo procesar la respuesta del servidor') throw e;
      throw new Error('No se pudo procesar la respuesta del servidor');
    }
  }

  return res.json();
}

export async function fetchProfile(token: string) {
  const res = await fetch(`${API_URL}/usuarios/perfil/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Fallo al obtener perfil');
  return res.json();
}
