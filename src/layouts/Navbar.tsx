'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { fetchProfile } from '@/lib/api/auth';
import styles from './Navbar.module.css';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Laboratorios', href: '/laboratorios' },
  { label: 'Reservas',     href: '/reservas' },
  { label: 'Actividades',  href: '/actividades' },
  { label: 'Incidencias',  href: '/incidencias' },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [profile, setProfile]         = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    if (token) {
      fetchProfile(token)
        .then(data => setProfile(data))
        .catch(() => setProfile(null));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const getInitials = (name: string) => (name?.slice(0, 2).toUpperCase() || 'U');

  return (
    <nav className={styles.navbar}>
      {/* Hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>

      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        GestorLab
      </Link>

      {/* Nav links */}
      <div className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ''}`}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href || pathname?.startsWith(item.href + '/') ? styles.navLinkActive : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* User area */}
      <div className={styles.userArea} ref={dropdownRef}>
        <button
          className={styles.userButton}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className={styles.avatar}>
            {getInitials(profile?.username || '')}
          </span>
          <span className={styles.userName}>{profile?.username || 'Usuario'}</span>
          <svg
            className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
            width="12" height="12" viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {dropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{profile?.username || 'Usuario'}</div>
              <div className={styles.dropdownRole}>
                {profile?.roles?.join(', ') || 'Sin rol asignado'}
              </div>
            </div>
            <button
              className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
              onClick={handleLogout}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
