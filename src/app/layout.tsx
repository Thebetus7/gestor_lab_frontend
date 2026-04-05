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
        {children}
      </body>
    </html>
  );
}
