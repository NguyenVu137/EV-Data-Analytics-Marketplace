import React from 'react';
import classNames from 'classnames';

export const Badge = ({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className, ...props }) => {
  const statusMap = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'warning', label: 'Inactive' },
    error: { variant: 'error', label: 'Error' },
    processing: { variant: 'primary', label: 'Processing' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'error', label: 'Failed' }
  };

  const statusConfig = statusMap[status] || statusMap.inactive;

  return (
    <Badge
      variant={statusConfig.variant}
      className={className}
      {...props}
    >
      <span className={classNames(
        'w-2 h-2 mr-1.5 rounded-full',
        {
          'bg-success-500': status === 'active' || status === 'completed',
          'bg-warning-500': status === 'inactive' || status === 'pending',
          'bg-error-500': status === 'error' || status === 'failed',
          'bg-primary-500': status === 'processing'
        }
      )} />
      {statusConfig.label}
    </Badge>
  );
};