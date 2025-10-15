import React from 'react';
import classNames from 'classnames';

const Card = React.forwardRef(({
  children,
  className,
  hover = false,
  padding = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={classNames(
        'bg-white rounded-lg shadow-card',
        'dark:bg-secondary-800 dark:border dark:border-secondary-700',
        hover && 'transition-shadow hover:shadow-lg',
        padding && 'p-4 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className, ...props }) => (
  <div 
    className={classNames(
      'border-b border-secondary-200 dark:border-secondary-700',
      'pb-4 mb-4',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 
    className={classNames(
      'text-lg font-medium text-secondary-900 dark:text-white',
      className
    )} 
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div 
    className={classNames(
      'border-t border-secondary-200 dark:border-secondary-700',
      'pt-4 mt-4',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export default Card;