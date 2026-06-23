'use client';

import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      marginTop: 'calc(var(--nav-height) * -1 - var(--sp-8))',
      marginLeft: 'calc(var(--sp-6) * -1)',
      marginRight: 'calc(var(--sp-6) * -1)'
    }}>
      {/* Hero Section */}
      <header style={{
        position: 'relative',
        padding: 'calc(var(--nav-height) + var(--sp-12)) var(--sp-8) calc(var(--sp-12) * 1.5)',
        background: 'radial-gradient(circle at top right, #eef8fc 0%, var(--surface) 100%)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        animation: 'fadeIn 0.8s ease',
        borderBottom: '1px solid var(--surface-container-high)'
      }}>
        {/* Glowing Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 140, 199, 0.12) 0%, rgba(0, 140, 199, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-8)',
          textAlign: 'left',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Column (Text & Actions) */}
          <div style={{ flex: '1 1 450px', zIndex: 2 }}>

            <h1 style={{ 
              fontSize: '3.75rem', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
              marginBottom: 'var(--sp-6)',
              color: 'var(--text-primary)',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Administra tus Laboratorios con <br/>
              <span style={{ 
                background: 'linear-gradient(90deg, #008cc7 0%, var(--primary-container) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Precisión Absoluta</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--sp-10)',
              maxWidth: '550px',
              lineHeight: 1.65,
              fontWeight: 400
            }}>
              GestorLab centraliza el control de equipos, reservas, personal e incidencias en una plataforma integrada de alto rendimiento.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn" style={{ 
                padding: 'var(--sp-3) var(--sp-8)', 
                fontSize: '1.125rem',
                background: 'linear-gradient(135deg, #008cc7 0%, #005a80 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0, 140, 199, 0.2)',
                borderRadius: 'var(--radius-xl)'
              }}>
                Comenzar Ahora
              </Link>
              {/* Botón de descarga de App */}
              <button className="btn" style={{ 
                padding: 'var(--sp-3) var(--sp-8)', 
                fontSize: '1.125rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar App
              </button>
            </div>
          </div>

          {/* Right Column (3D Angled Interactive Card) */}
          <div style={{
            flex: '1 1 400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(20px)',
              padding: 'var(--sp-3)',
              width: '100%',
              maxWidth: '500px',
              transform: 'perspective(1000px) rotateY(-8deg) rotateX(6deg) rotateZ(-1deg)',
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(1.03)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(6deg) rotateZ(-1deg)'}
            >
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop" 
                alt="GestorLab Workflow Showcase"
                style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-xl)', display: 'block' }}
              />
              
              {/* Floating metrics chip */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: 'var(--shadow-md)',
                animation: 'slideUp 0.8s ease'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponibilidad</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success-text)' }}>99.8% Equipos Activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section style={{ padding: 'var(--sp-12) var(--sp-8)', background: 'var(--surface-container-lowest)' }}>
        <div className="container" style={{ animation: 'slideUp 0.6s ease 0.2s both' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>Todo lo que necesitas</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '500px', margin: '0 auto' }}>
              Las herramientas esenciales para mantener tu laboratorio operativo y organizado.
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--sp-8)' 
          }}>
            {features.map((feat, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="card" style={{ 
                  display: 'flex', 
                  flexDirection: isEven ? 'row' : 'row-reverse', 
                  alignItems: 'center',
                  overflow: 'hidden',
                  padding: 0,
                  gap: 'var(--sp-6)',
                  minHeight: '300px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 400px', height: '300px', overflow: 'hidden' }}>
                    <img 
                      src={feat.image} 
                      alt={feat.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                  <div style={{ flex: '1 1 300px', padding: 'var(--sp-6)' }}>
                    <span className="badge badge-accent" style={{ marginBottom: 'var(--sp-2)' }}>0{idx + 1}</span>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--sp-2)', fontFamily: 'Manrope, sans-serif' }}>{feat.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Desarrolladores Section */}
      <section style={{ padding: 'var(--sp-12) var(--sp-8)', background: 'var(--surface)' }}>
        <div className="container" style={{ textAlign: 'center', animation: 'slideUp 0.6s ease 0.4s both' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-10)' }}>Equipo de Desarrollo</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--sp-8)' }}>
            {developers.map((dev, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: 'var(--radius-full)',
                  background: 'var(--surface-container-high)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--sp-4)', fontSize: '2.5rem', color: 'var(--text-muted)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  🧑‍💻
                </div>
                <h3 style={{ fontSize: '1.125rem' }}>{dev.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{dev.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        marginTop: 'auto', 
        padding: 'var(--sp-8)', 
        background: 'var(--primary-container)', 
        color: 'var(--on-primary-container)',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--on-primary)', marginBottom: 'var(--sp-2)' }}>
            Gestor<span style={{ color: 'var(--accent)' }}>Lab</span>
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--sp-4)' }}>© {new Date().getFullYear()} GestorLab. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Laboratorios y Equipos',
    description: 'Inventario en tiempo real. Conoce la disponibilidad y estado de computadoras, servidores y hardware en tus laboratorios de sistemas.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Reservas Inteligentes',
    description: 'Sistema de programación sin conflictos para reservar computadoras, mesas de trabajo y laboratorios de computación.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Seguimiento de Actividades',
    description: 'Controla flujos de prácticas, asigna laboratorios de código y lleva registro de las materias y software de desarrollo requeridos.',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Reporte de Incidencias',
    description: 'Notifica fallas de red, problemas de software, hardware inoperativo o computadoras dañadas de forma inmediata.',
    image: 'https://images.unsplash.com/photo-1597839219216-a773cb2473e4?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Gestión de Personal',
    description: 'Administra accesos de red, roles y permisos para alumnos de ingeniería, docentes y auxiliares de laboratorio.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop'
  }
];

const developers = [
  { name: '[Nombre Apellidos 1]', role: 'Desarrollador Full Stack' },
  { name: '[Nombre Apellidos 2]', role: 'Desarrollador Full Stack' },
  { name: '[Nombre Apellidos 3]', role: 'Desarrollador Full Stack' },
];
