/**
 * Badge.tsx — Componente de estado reutilizable
 */

type BadgeVariant = 'pending' | 'success' | 'danger' | 'info' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantMap: Record<BadgeVariant, string> = {
  pending: 'badge badge-pending',
  success: 'badge badge-success',
  danger:  'badge badge-danger',
  info:    'badge badge-info',
  accent:  'badge badge-accent',
};

export default function Badge({ variant = 'info', children }: BadgeProps) {
  return (
    <span className={variantMap[variant]}>
      {children}
    </span>
  );
}

/** Helper: devuelve variante según estado de tarea */
export function estadoToVariant(estado: string): BadgeVariant {
  switch (estado) {
    case 'realizado': return 'success';
    case 'problema':  return 'danger';
    default:          return 'pending'; // 'espera'
  }
}

export function estadoToLabel(estado: string): string {
  switch (estado) {
    case 'realizado': return 'Realizado';
    case 'problema':  return 'Problema';
    default:          return 'En Espera';
  }
}
