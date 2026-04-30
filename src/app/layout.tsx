import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'GestorLab',
  description: 'Sistema de Gestión de Laboratorios',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}

