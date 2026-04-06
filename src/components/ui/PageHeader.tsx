/**
 * PageHeader.tsx — Encabezado de página reutilizable
 */
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Etiqueta (pill) pequeña sobre el título */
  tag?: string;
}

export default function PageHeader({ title, subtitle, action, tag }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 'var(--sp-8)',
      gap: 'var(--sp-4)',
    }}>
      <div>
        {tag && (
          <span style={{
            display: 'inline-block',
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--on-accent-container)',
            background: 'var(--accent-container)',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--sp-2)',
          }}>
            {tag}
          </span>
        )}
        <h1 style={{ marginBottom: subtitle ? 4 : 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '1rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
