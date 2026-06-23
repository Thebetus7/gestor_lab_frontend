/**
 * lib/api/users.ts
 * Funciones de gestión de usuarios (CRUD administrador).
 */

import { API_URL } from './auth';

export async function fetchUsersList(token: string) {
  const res = await fetch(`${API_URL}/usuarios/gestion/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Fallo al obtener la lista de usuarios');
  }
  return res.json();
}

export async function createUser(token: string, userData: any) {
  const res = await fetch(`${API_URL}/usuarios/gestion/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Fallo al crear el usuario');
  }
  return res.json();
}

export async function updateUser(token: string, id: number, updateData: any) {
  const res = await fetch(`${API_URL}/usuarios/gestion/${id}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Fallo al actualizar el usuario');
  }
  return res.json();
}

export async function deleteUser(token: string, id: number) {
  const res = await fetch(`${API_URL}/usuarios/gestion/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Fallo al eliminar el usuario');
  }
  return res.json();
}
