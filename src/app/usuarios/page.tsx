'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import UsersTable from './_components/UsersTable';
import CreateUserModal from './_components/CreateUserModal';
import { fetchUsersList, createUser, updateUser, deleteUser } from '@/lib/api/users';
import { fetchProfile } from '@/lib/api/auth';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active?: boolean;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const tokenCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='));
    const access = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!access) {
      router.push('/login');
      return;
    }

    setToken(access);

    // Fetch user profile and list
    Promise.all([fetchProfile(access), fetchUsersList(access)])
      .then(([profileData, usersData]) => {
        // Safe check: Only admins can access this page
        if (!profileData.roles?.includes('admin')) {
          router.push('/dashboard');
          return;
        }
        setProfile(profileData);
        setUsers(usersData);
      })
      .catch((err) => {
        console.error(err);
        setError('Error al cargar la información de usuarios.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const data = await fetchUsersList(token);
      setUsers(data);
    } catch (err) {
      setError('Error al refrescar la lista.');
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!token) return;
    const nextState = !user.is_active;
    const action = nextState ? 'activar' : 'desactivar';
    if (!confirm(`¿Estás seguro de que deseas ${action} al usuario "${user.username}"?`)) {
      return;
    }

    try {
      await updateUser(token, user.id, { is_active: nextState });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!token) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar (soft-delete) al usuario "${user.username}"? No aparecerá en la lista pero se conservará en registros.`)) {
      return;
    }

    try {
      await deleteUser(token, user.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario.');
    }
  };

  const handleCreateUserSubmit = async (payload: any) => {
    if (!token) return;
    await createUser(token, payload);
    await loadUsers();
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
        <p>Cargando gestión de usuarios...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <PageHeader
        tag="Configuración"
        title="Gestión de Usuarios"
        subtitle="Administra cuentas de acceso, roles y disponibilidad de personal del laboratorio"
        action={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Nuevo Usuario
          </button>
        }
      />

      {error && (
        <div className="error-msg" style={{ marginBottom: 'var(--sp-4)' }}>
          {error}
        </div>
      )}

      {/* Tabla de Usuarios con Filtros */}
      <UsersTable
        users={users}
        profile={profile}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteUser}
      />

      {/* Modal para Crear Usuario */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUserSubmit}
      />
    </div>
  );
}
