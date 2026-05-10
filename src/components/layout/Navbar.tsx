'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { fetchProfile } from '@/lib/api/auth';
import styles from './Navbar.module.css';

interface UserProfile {
  username: string;
  email: string;
  rol?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const checkAuth = async () => {
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;
      
      if (token) {
        setIsAuthenticated(true);
        try {
          const userData = await fetchProfile(token);
          setProfile(userData);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        }
      } else {
        setIsAuthenticated(false);
        setProfile(null);
      }
    };

    checkAuth();
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; max-age=0';
    setIsAuthenticated(false);
    setProfile(null);
    router.push('/welcome');
  };

  const isWelcomePage = pathname === '/welcome';

  return (
    <nav 
      className={`${styles.navbar} ${isWelcomePage ? styles.welcomeNav : ''}`}
      style={isWelcomePage ? { 
        boxShadow: 'none', 
        borderBottom: 'none', 
        background: 'transparent' 
      } : {}}
    >
      {/* Mobile Hamburger */}
      <button 
        className={styles.hamburger} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <Link href="/" className={styles.logo}>
        GestorLab
      </Link>
      
      <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
        {isAuthenticated ? (
          <>
            <Link 
              href="/" 
              className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/laboratorios" 
              className={`${styles.navLink} ${pathname === '/laboratorios' ? styles.navLinkActive : ''}`}
            >
              Laboratorios
            </Link>
            <Link 
              href="/reservas" 
              className={`${styles.navLink} ${pathname === '/reservas' ? styles.navLinkActive : ''}`}
            >
              Reservas
            </Link>
            <Link 
              href="/actividades" 
              className={`${styles.navLink} ${pathname === '/actividades' ? styles.navLinkActive : ''}`}
            >
              Actividades
            </Link>
            <Link 
              href="/incidencias" 
              className={`${styles.navLink} ${pathname === '/incidencias' ? styles.navLinkActive : ''}`}
            >
              Incidencias
            </Link>
          </>
        ) : (
          <div style={{ visibility: 'hidden' }}>Spacer</div>
        )}
      </div>

      <div className={styles.userArea}>
        {isAuthenticated ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              className={styles.userButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={styles.avatar}>
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className={styles.userName}>
                {profile?.username || 'Cargando...'}
              </span>
              <svg 
                className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownName}>{profile?.username}</div>
                  <div className={styles.dropdownRole}>{profile?.rol || 'Usuario'}</div>
                </div>
                
                <Link href="/profile" className={styles.dropdownItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Configuración de perfil
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
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
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: '0.9375rem' }}>
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9375rem' }}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
