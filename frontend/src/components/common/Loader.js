import React from 'react';
import classNames from 'classnames';

const Loader = ({ 
  size = 'md', 
  fullscreen = false,
  className,
  text,
  ...props 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const loader = (
    <div className={classNames(
      'flex flex-col items-center justify-center',
      fullscreen ? 'fixed inset-0 bg-white bg-opacity-75 dark:bg-secondary-900 dark:bg-opacity-75' : '',
      className
    )} {...props}>
      <svg
        className={classNames(
          'animate-spinner text-primary-600',
          sizes[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text && (
        <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
          {text}
        </p>
      )}
    </div>
  );

  return fullscreen ? (
    <div className="fixed inset-0 z-50">
      {loader}
    </div>
  ) : loader;
};

export default Loader;

export const LoaderOverlay = ({ children, loading, ...props }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-secondary-900 dark:bg-opacity-75">
          <Loader {...props} />
        </div>
      )}
    </div>
  );
};