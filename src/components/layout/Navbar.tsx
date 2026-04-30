'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Basic check for token in cookies
    const hasToken = document.cookie.includes('access_token=');
    setIsAuthenticated(hasToken);
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; max-age=0';
    setIsAuthenticated(false);
    router.push('/welcome');
  };

  const isWelcomePage = pathname === '/welcome';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: isWelcomePage ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
      padding: '0 var(--sp-6)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: isWelcomePage ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
          GestorLab
        </Link>
        
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
            <Link 
              href="/" 
              style={{ 
                color: pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: pathname === '/' ? 600 : 500,
                textDecoration: 'none',
                fontSize: '0.9375rem'
              }}
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        {isAuthenticated ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                padding: 'var(--sp-2) var(--sp-4)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                transition: 'background 0.2s ease'
              }}
            >
              Mi Cuenta
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                minWidth: '200px',
                padding: 'var(--sp-2) 0',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100
              }}>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: 'var(--sp-2) var(--sp-4)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-2)'
                  }}
                  className="dropdown-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Configuración de perfil
                </Link>
                
                <div style={{ height: '1px', background: 'var(--border-color)', margin: 'var(--sp-1) 0' }}></div>
                
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    padding: 'var(--sp-2) var(--sp-4)',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-2)'
                  }}
                  className="dropdown-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--text-secondary)', 
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem'
              }}
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="btn btn-primary"
              style={{ 
                padding: 'var(--sp-2) var(--sp-4)',
                textDecoration: 'none',
                fontSize: '0.9375rem'
              }}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
