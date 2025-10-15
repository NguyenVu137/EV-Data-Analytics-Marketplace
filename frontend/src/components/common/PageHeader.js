import React from 'react';
import classNames from 'classnames';

const PageHeader = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={classNames(
        'bg-white dark:bg-secondary-900',
        'border-b border-secondary-200 dark:border-secondary-800',
        'mb-8',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-secondary-900 dark:text-white sm:text-3xl sm:truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="mt-4 flex md:mt-0 md:ml-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;