'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active?: boolean;
}

interface Props {
  users: User[];
  profile: any;
  onToggleActive: (user: User) => Promise<void>;
  onDelete: (user: User) => Promise<void>;
}

export default function UsersTable({ users, profile, onToggleActive, onDelete }: Props) {
  // Estado para controlar qué popover de filtro de columna está abierto
  const [activePopover, setActivePopover] = useState<'username' | 'name' | 'email' | 'role' | 'status' | null>(null);

  // Estados de Filtro de Columnas
  const [colUsername, setColUsername] = useState('');
  const [colName, setColName] = useState('');
  const [colEmail, setColEmail] = useState('');
  const [colRole, setColRole] = useState('all');
  const [colStatus, setColStatus] = useState('all');

  // Lógica de filtrado reactiva acumulativa
  const filteredUsers = users.filter((u) => {
    const usernameMatch = !colUsername || u.username.toLowerCase().includes(colUsername.toLowerCase());

    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
    const nameMatch = !colName || fullName.includes(colName.toLowerCase());

    const emailMatch = !colEmail || (u.email || '').toLowerCase().includes(colEmail.toLowerCase());

    const roleMatch = !colRole || colRole === 'all' || 
      (colRole === 'none' && (!u.roles || u.roles.length === 0)) ||
      (u.roles && u.roles.includes(colRole));

    const statusMatch = !colStatus || colStatus === 'all' ||
      (colStatus === 'active' && u.is_active !== false) ||
      (colStatus === 'inactive' && u.is_active === false);

    return usernameMatch && nameMatch && emailMatch && roleMatch && statusMatch;
  });

  const handleTogglePopover = (col: 'username' | 'name' | 'email' | 'role' | 'status') => {
    setActivePopover(prev => prev === col ? null : col);
  };

  const closePopovers = () => {
    setActivePopover(null);
  };

  // Icono SVG de Embudo / Filtro
  const FilterIcon = ({ isActive }: { isActive: boolean }) => (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill={isActive ? 'var(--accent)' : 'none'} 
      stroke={isActive ? 'var(--accent)' : 'currentColor'} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginLeft: 6, cursor: 'pointer', verticalAlign: 'middle', transition: 'color 0.2s' }}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Overlay invisible para cerrar el popover al hacer clic fuera */}
      {activePopover && (
        <div 
          onClick={closePopovers}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90,
            background: 'transparent',
            cursor: 'default'
          }}
        />
      )}

      {/* Tabla de Resultados */}
      <div className="card" style={{ overflowX: 'visible', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-xl)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)' }}>
              
              {/* Columna Usuario */}
              <th style={{ textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('username')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: colUsername ? 'var(--accent)' : 'inherit' }}>
                  Usuario
                  <FilterIcon isActive={!!colUsername} />
                </span>
                {activePopover === 'username' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '220px', marginTop: '4px' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--sp-2)' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Filtrar Usuario</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={colUsername} 
                        onChange={(e) => setColUsername(e.target.value)}
                        placeholder="Escribe usuario..."
                        autoFocus
                        style={{ fontSize: '0.85rem', padding: '6px 8px', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    {colUsername && (
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => { setColUsername(''); closePopovers(); }}
                        style={{ fontSize: '0.75rem', padding: '4px 0', width: '100%', textAlign: 'center', color: 'var(--danger)' }}
                      >
                        Limpiar Filtro
                      </button>
                    )}
                  </div>
                )}
              </th>

              {/* Columna Nombre Completo */}
              <th style={{ textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('name')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: colName ? 'var(--accent)' : 'inherit' }}>
                  Nombre Completo
                  <FilterIcon isActive={!!colName} />
                </span>
                {activePopover === 'name' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '220px', marginTop: '4px' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--sp-2)' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Filtrar Nombre</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={colName} 
                        onChange={(e) => setColName(e.target.value)}
                        placeholder="Escribe nombre..."
                        autoFocus
                        style={{ fontSize: '0.85rem', padding: '6px 8px', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    {colName && (
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => { setColName(''); closePopovers(); }}
                        style={{ fontSize: '0.75rem', padding: '4px 0', width: '100%', textAlign: 'center', color: 'var(--danger)' }}
                      >
                        Limpiar Filtro
                      </button>
                    )}
                  </div>
                )}
              </th>

              {/* Columna Correo Electrónico */}
              <th style={{ textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('email')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: colEmail ? 'var(--accent)' : 'inherit' }}>
                  Correo Electrónico
                  <FilterIcon isActive={!!colEmail} />
                </span>
                {activePopover === 'email' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '220px', marginTop: '4px' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--sp-2)' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Filtrar Correo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={colEmail} 
                        onChange={(e) => setColEmail(e.target.value)}
                        placeholder="Escribe correo..."
                        autoFocus
                        style={{ fontSize: '0.85rem', padding: '6px 8px', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    {colEmail && (
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => { setColEmail(''); closePopovers(); }}
                        style={{ fontSize: '0.75rem', padding: '4px 0', width: '100%', textAlign: 'center', color: 'var(--danger)' }}
                      >
                        Limpiar Filtro
                      </button>
                    )}
                  </div>
                )}
              </th>

              {/* Columna Roles */}
              <th style={{ textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('role')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: colRole !== 'all' ? 'var(--accent)' : 'inherit' }}>
                  Roles
                  <FilterIcon isActive={colRole !== 'all'} />
                </span>
                {activePopover === 'role' && (
                  <div style={{ position: 'absolute', top: '100%', left: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '200px', marginTop: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px' }}>Seleccionar Rol</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { label: 'Todos los Roles', value: 'all' },
                        { label: 'Administrador', value: 'admin' },
                        { label: 'Auxiliar', value: 'auxiliar' },
                        { label: 'Operador', value: 'operador' },
                        { label: 'Sin Rol', value: 'none' }
                      ].map((item) => (
                        <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: colRole === item.value ? '600' : 'normal', color: colRole === item.value ? 'var(--accent)' : 'inherit' }}>
                          <input 
                            type="radio" 
                            name="colRoleRadio" 
                            checked={colRole === item.value}
                            onChange={() => { setColRole(item.value); closePopovers(); }}
                            style={{ cursor: 'pointer' }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </th>

              {/* Columna Estado */}
              <th style={{ textAlign: 'center', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)', position: 'relative', userSelect: 'none' }}>
                <span onClick={() => handleTogglePopover('status')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: colStatus !== 'all' ? 'var(--accent)' : 'inherit' }}>
                  Estado
                  <FilterIcon isActive={colStatus !== 'all'} />
                </span>
                {activePopover === 'status' && (
                  <div style={{ position: 'absolute', top: '100%', right: 'var(--sp-4)', zIndex: 100, background: 'var(--surface-container-lowest)', padding: 'var(--sp-3)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '180px', marginTop: '4px', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px' }}>Seleccionar Estado</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { label: 'Todos los Estados', value: 'all' },
                        { label: 'Activos', value: 'active' },
                        { label: 'Desactivados', value: 'inactive' }
                      ].map((item) => (
                        <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: colStatus === item.value ? '600' : 'normal', color: colStatus === item.value ? 'var(--accent)' : 'inherit' }}>
                          <input 
                            type="radio" 
                            name="colStatusRadio" 
                            checked={colStatus === item.value}
                            onChange={() => { setColStatus(item.value); closePopovers(); }}
                            style={{ cursor: 'pointer' }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </th>

              <th style={{ textAlign: 'right', padding: 'var(--sp-3) var(--sp-4)', borderBottom: '2px solid var(--outline-variant)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--outline)' }}>
                  No se encontraron usuarios que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = profile?.id === u.id || profile?.username === u.username;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                    <td style={{ padding: 'var(--sp-4)', fontWeight: 600 }}>{u.username}</td>
                    <td style={{ padding: 'var(--sp-4)' }}>
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : 'Sin Nombre'}
                    </td>
                    <td style={{ padding: 'var(--sp-4)', color: 'var(--outline)' }}>{u.email || '-'}</td>
                    <td style={{ padding: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--sp-1)', flexWrap: 'wrap' }}>
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={role === 'admin' ? 'danger' : role === 'auxiliar' ? 'info' : 'success'}
                            >
                              {role.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="pending">Sin Rol</Badge>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                      <Badge variant={u.is_active !== false ? 'success' : 'danger'}>
                        {u.is_active !== false ? 'Activo' : 'Desactivado'}
                      </Badge>
                    </td>
                    <td style={{ padding: 'var(--sp-4)', textAlign: 'right' }}>
                      {isSelf ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--outline)', fontStyle: 'italic' }}>
                          Tú (Actual)
                        </span>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: 'var(--sp-2)' }}>
                          <button
                            onClick={() => onToggleActive(u)}
                            className="btn"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.8125rem',
                              background: u.is_active !== false ? 'var(--surface-container-high)' : 'var(--success-container)',
                              color: u.is_active !== false ? 'var(--on-surface)' : 'var(--success)',
                              border: '1px solid var(--outline-variant)',
                            }}
                          >
                            {u.is_active !== false ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => onDelete(u)}
                            className="btn btn-danger"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.8125rem',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
