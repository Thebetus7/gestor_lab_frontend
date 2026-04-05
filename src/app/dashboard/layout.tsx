import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
    </>
  );
}
