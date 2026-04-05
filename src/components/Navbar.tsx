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
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Laboratorios', href: '/dashboard/laboratorios' },
  { label: 'Reservas', href: '/dashboard/reservas' },
  { label: 'Actividades', href: '/dashboard/actividades' },
  { label: 'Incidencias', href: '/dashboard/incidencias' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tokenCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
      fetchProfile(token)
        .then((data) => setProfile(data))
        .catch(() => setProfile(null));
    }
  }, []);

  // Close dropdown on click outside
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

  const getInitials = (username: string) => {
    return username?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <nav className={styles.navbar}>
      {/* Hamburger (mobile) */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menú"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        GestorLab
      </Link>

      {/* Nav links */}
      <div className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
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
          <span>{profile?.username || 'Usuario'}</span>
          <span className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}>
            ▾
          </span>
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
              ⏻ Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
