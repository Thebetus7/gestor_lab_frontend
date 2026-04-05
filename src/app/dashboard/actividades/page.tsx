'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { 
  getActividades, 
  deleteActividad, 
  createActividad, 
  getActividadDetail 
} from '@/lib/api/laboratorio';

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShowOpen, setIsShowOpen] = useState(false);
  
  // Detalle para Mostrar
  const [actividadDetalle, setActividadDetalle] = useState<any>(null);

  // Formulario Crear Actividad
  const [descripcion, setDescripcion] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [tareas, setTareas] = useState<string[]>(['']); // Inicial con 1 vacía

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    const currentToken = tokenCookie ? tokenCookie.split('=')[1] : null;
    
    if (currentToken) {
      setToken(currentToken);
      fetchActividades(currentToken);
    }
  }, []);

  const fetchActividades = async (t: string) => {
    try {
      const dbActividades = await getActividades(t);
      setActividades(dbActividades);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpen = () => {
    setDescripcion('');
    setTiempo('');
    setTareas(['']);
    setIsCreateOpen(true);
  };

  const handleModifyTarea = (index: number, val: string) => {
    const newTareas = [...tareas];
    newTareas[index] = val;
    // Si está escribiendo en la última línea y se empieza a llenar, agregar otra vacía
    if (index === newTareas.length - 1 && val.trim() !== '') {
      newTareas.push('');
    }
    setTareas(newTareas);
  };

  const handleSubmitCreate = async () => {
    if (!token) return;
    try {
      // Filtrar strings vacíos (incluida la última por defecto)
      const validTareas = tareas.filter(t => t.trim() !== '');
      await createActividad(token, {
        descripcion,
        tiempo: tiempo ? `${tiempo}:00` : undefined, // Format HH:MM:00
        tareas: validTareas
      });
      setIsCreateOpen(false);
      fetchActividades(token);
    } catch (err) {
      alert("Error al crear la actividad");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("¿Seguro que deseas eliminar esta actividad?")) return;
    try {
      await deleteActividad(token, id);
      fetchActividades(token);
    } catch (err) {
      alert("Error al eliminar la actividad");
    }
  };

  const handleShow = async (id: number) => {
    if (!token) return;
    try {
      const data = await getActividadDetail(token, id);
      setActividadDetalle(data);
      setIsShowOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'realizado':
        return <span className="badge badge-success">Realizado</span>;
      case 'problema':
        return <span className="badge badge-danger">Problema</span>;
      default:
        // 'espera' por defecto
        return <span className="badge badge-pending">Espera</span>;
    }
  };

  if (loading) return <div className="container"><p>Cargando actividades...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1>Actividades</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestor de actividades y sus tareas (Web / Jefe de Laboratorio)</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateOpen}>
          + Nueva Actividad
        </button>
      </div>

      <div className="card">
        {actividades.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--sp-6)' }}>
            No hay actividades registradas.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 'var(--sp-3)' }}>#ID</th>
                <th style={{ padding: 'var(--sp-3)' }}>Descripción</th>
                <th style={{ padding: 'var(--sp-3)' }}>Tiempo</th>
                <th style={{ padding: 'var(--sp-3)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map(act => (
                <tr key={act.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--sp-3)', fontWeight: '500' }}>{act.id}</td>
                  <td style={{ padding: 'var(--sp-3)' }}>{act.descripcion || 'Sin descripción'}</td>
                  <td style={{ padding: 'var(--sp-3)' }}>{act.tiempo || '--:--'}</td>
                  <td style={{ padding: 'var(--sp-3)', display: 'flex', gap: 'var(--sp-2)' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => handleShow(act.id)}
                    >
                      👁 Ver Detalles
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => handleDelete(act.id)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Crear */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nueva Actividad"
        footer={
          <div style={{ display: 'flex', gap: 'var(--sp-3)', width: '100%', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmitCreate}>Guardar Actividad</button>
          </div>
        }
      >
        <div className="form-group">
          <label>Descripción (Opcional)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Escribe información sobre la actividad..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Tiempo Esperado</label>
          <input 
            type="time" 
            className="form-input" 
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Tareas Dinámicas</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Escribe una tarea y automáticamente se agregará un campo nuevo debajo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {tareas.map((tareaStr, idx) => (
              <input
                key={idx}
                type="text"
                className="form-input"
                placeholder={idx === 0 ? "Ej. 'revisar office'" : "Crea otra tarea..."}
                value={tareaStr}
                onChange={(e) => handleModifyTarea(idx, e.target.value)}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal para Ver Detalles */}
      <Modal
        isOpen={isShowOpen}
        onClose={() => setIsShowOpen(false)}
        title={`Detalle de Actividad #${actividadDetalle?.id}`}
        footer={
          <button className="btn btn-secondary" onClick={() => setIsShowOpen(false)}>
            Cerrar
          </button>
        }
      >
        {actividadDetalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div>
              <p><strong>Descripción:</strong> {actividadDetalle.descripcion || 'Sin descripción'}</p>
              <p style={{ marginTop: '4px' }}><strong>Tiempo:</strong> {actividadDetalle.tiempo || 'No definido'}</p>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--sp-3)' }}>Lista de Tareas</h3>
              
              {actividadDetalle.actividad_tareas.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay tareas registradas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {actividadDetalle.actividad_tareas.map((at: any) => (
                    <div 
                      key={at.id}
                      style={{ 
                        border: '1px solid var(--border)', 
                        padding: 'var(--sp-3)', 
                        borderRadius: '8px',
                        background: 'var(--bg-page)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{at.tarea_descripcion}</strong>
                        {getEstadoBadge(at.estado)}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--sp-2)' }}>
                        <strong>Observación: </strong> 
                        {at.observacion || 'Ninguna observación dejada por el auxiliar.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
