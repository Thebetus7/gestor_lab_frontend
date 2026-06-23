'use client';

import { useState } from 'react';

interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}

export default function CreateUserModal({ isOpen, onClose, onSubmit }: Props) {
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('auxiliar');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        first_name: firstNameInput,
        last_name: lastNameInput,
        role: roleInput,
      });
      // Resetear campos
      setUsernameInput('');
      setEmailInput('');
      setPasswordInput('');
      setFirstNameInput('');
      setLastNameInput('');
      setRoleInput('auxiliar');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setUsernameInput('');
    setEmailInput('');
    setPasswordInput('');
    setFirstNameInput('');
    setLastNameInput('');
    setRoleInput('auxiliar');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: 'var(--sp-6)',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--outline-variant)',
        }}
      >
        <h3 style={{ marginBottom: 'var(--sp-4)', fontFamily: 'Manrope', fontWeight: 700 }}>Registrar Nuevo Usuario</h3>

        {error && (
          <div className="error-msg" style={{ marginBottom: 'var(--sp-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 'var(--sp-3)' }}>
            <label>Nombre de Usuario *</label>
            <input
              type="text"
              className="form-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="ej. auxCarlos"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--sp-3)' }}>
            <label>Contraseña *</label>
            <input
              type="password"
              className="form-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--sp-3)' }}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="carlos@ejemplo.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="form-input"
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
                placeholder="Carlos"
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                className="form-input"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                placeholder="Gómez"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
            <label>Rol asignado *</label>
            <select
              className="form-input"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface)',
              }}
              required
            >
              <option value="auxiliar">Auxiliar</option>
              <option value="admin">Administrador (Admin)</option>
              <option value="operador">Operador</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
