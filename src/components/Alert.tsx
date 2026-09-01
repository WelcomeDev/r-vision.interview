import { ReactNode } from 'react';

export interface AlertProps {
  variant?: 'info' | 'error' | 'success';
  title?: string;
  children?: ReactNode;
}

export function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <div>
        {title && <div className="alert__title">{title}</div>}
        {children}
      </div>
    </div>
  );
}
