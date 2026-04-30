export default function WelcomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: 'var(--sp-8)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: 'var(--sp-6)'
        }}>
          Gestiona tus laboratorios con <span style={{ color: 'var(--primary)' }}>precisión</span>
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 'var(--sp-8)',
          maxWidth: '600px',
          margin: '0 auto var(--sp-8)'
        }}>
          GestorLab es la plataforma integral para administrar equipos, horarios, y personal de laboratorio, diseñada para optimizar cada aspecto de tu centro de investigación o educación.
        </p>

        <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center' }}>
          <a href="/register" className="btn btn-primary" style={{ padding: 'var(--sp-3) var(--sp-6)', fontSize: '1.125rem' }}>
            Comenzar Ahora
          </a>
          <a href="/login" className="btn" style={{ 
            background: 'white', 
            color: 'var(--text-primary)', 
            border: '1px solid var(--border-color)',
            padding: 'var(--sp-3) var(--sp-6)', 
            fontSize: '1.125rem' 
          }}>
            Ingresar
          </a>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div style={{
        marginTop: 'var(--sp-12)',
        width: '100%',
        maxWidth: '1000px',
        height: '400px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--sp-4)', color: 'var(--primary)', opacity: 0.8 }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <p>Vista previa del Dashboard (Próximamente)</p>
        </div>
      </div>
    </div>
  );
}
