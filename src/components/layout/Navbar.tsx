'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { fetchProfile } from '@/lib/api/auth';
import { getActividades, type ActividadList, getIncidencias, type Incidencia } from '@/lib/api/laboratorio';
import styles from './Navbar.module.css';

interface UserProfile {
  username: string;
  email: string;
  rol?: string;
  roles?: string[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [actividades, setActividades] = useState<ActividadList[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
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
          
          // Cargar actividades para la visualización del Navbar
          const actData = await getActividades();
          setActividades(actData);

          // Cargar incidencias
          const incData = await getIncidencias();
          setIncidencias(incData);
        } catch (error) {
          console.error("Error fetching profile, activities or incidents:", error);
          setProfile(null);
          setActividades([]);
          setIncidencias([]);
        }
      } else {
        setIsAuthenticated(false);
        setProfile(null);
        setActividades([]);
        setIncidencias([]);
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
    setActividades([]);
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
            <div className={styles.navLinkContainer}>
              <Link 
                href="/actividades" 
                className={`${styles.navLink} ${pathname === '/actividades' ? styles.navLinkActive : ''}`}
              >
                Actividades
                {actividades.length > 0 && (
                  <span className={styles.badge}>{actividades.length}</span>
                )}
              </Link>
              
              {/* Popover de Actividades Recientes */}
              {actividades.length > 0 && (
                <div className={styles.activitiesPopover}>
                  <div className={styles.popoverHeader}>Actividades Recientes</div>
                  <div className={styles.popoverList}>
                    {actividades.slice(0, 4).map((act) => (
                      <div key={act.id} className={styles.popoverItem}>
                        <div className={styles.popoverIcon}>📄</div>
                        <div className={styles.popoverContent}>
                          <div className={styles.popoverTitle}>Actividad #{act.id}</div>
                          <div className={styles.popoverDesc}>
                            {act.descripcion || 'Sin descripción detallada registrada'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/actividades" className={styles.popoverFooter}>
                    Ver todas las actividades →
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.navLinkContainer}>
              <Link 
                href="/incidencias" 
                className={`${styles.navLink} ${pathname === '/incidencias' ? styles.navLinkActive : ''}`}
              >
                Incidencias
                {incidencias.filter(inc => !inc.resuelto).length > 0 && (
                  <span className={`${styles.badge} ${styles.badgeDanger}`}>
                    {incidencias.filter(inc => !inc.resuelto).length}
                  </span>
                )}
              </Link>
              
              {/* Popover de Incidencias Recientes */}
              {incidencias.filter(inc => !inc.resuelto).length > 0 && (
                <div className={styles.activitiesPopover}>
                  <div className={`${styles.popoverHeader} ${styles.popoverHeaderDanger}`}>
                    Incidencias Activas
                  </div>
                  <div className={styles.popoverList}>
                    {incidencias.filter(inc => !inc.resuelto).slice(0, 4).map((inc) => (
                      <div key={inc.id} className={styles.popoverItem}>
                        <div className={styles.popoverIcon}>⚠️</div>
                        <div className={styles.popoverContent}>
                          <div className={styles.popoverTitle}>
                            Incidencia #{inc.id} ({inc.prioridad?.toUpperCase()})
                          </div>
                          <div className={styles.popoverDesc}>
                            {inc.descripcion || 'Sin descripción detallada registrada'}
                          </div>
                          {inc.nombre_lab && (
                            <div style={{ fontSize: '0.6875rem', marginTop: '2px', opacity: 0.8, color: 'var(--on-surface-variant)' }}>
                              📍 {inc.nombre_lab}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/incidencias" className={styles.popoverFooter}>
                    Ver todas las incidencias →
                  </Link>
                </div>
              )}
            </div>
            {profile?.roles?.includes('admin') && (
              <Link 
                href="/usuarios" 
                className={`${styles.navLink} ${pathname === '/usuarios' ? styles.navLinkActive : ''}`}
              >
                Usuarios
              </Link>
            )}
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
                  <div className={styles.dropdownRole}>{profile?.roles?.join(', ') || profile?.rol || 'Usuario'}</div>
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
