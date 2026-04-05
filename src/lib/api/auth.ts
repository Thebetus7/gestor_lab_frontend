export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Autentica un usuario contra el backend de Django.
 */
export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/usuarios/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Credenciales inválidas');
  }

  return res.json();
}

/**
 * Obtiene el perfil de usuario con su token.
 */
export async function fetchProfile(token: string) {
  const res = await fetch(`${API_URL}/usuarios/perfil/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Fallo al obtener perfil');
  }

  return res.json();
}
