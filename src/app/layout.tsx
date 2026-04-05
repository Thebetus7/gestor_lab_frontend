import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'GestorLab',
  description: 'Sistema de Gestión de Laboratorios',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="layout-header">
          <h1>GestorLab</h1>
          {/* Aquí podríamos mostrar usuario si tenemos contexto global */}
        </header>
        <main className="layout-main">
          {children}
        </main>
      </body>
    </html>
  );
}
