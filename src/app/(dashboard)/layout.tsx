import Navbar from '@/layouts/Navbar';
import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
    </>
  );
}
