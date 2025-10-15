import React from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const variants = {
  success: {
    icon: CheckCircleIcon,
    className: 'text-success-500 dark:text-success-400 bg-success-50 dark:bg-success-900',
  },
  error: {
    icon: XCircleIcon,
    className: 'text-error-500 dark:text-error-400 bg-error-50 dark:bg-error-900',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900',
  },
  warning: {
    icon: ExclamationCircleIcon,
    className: 'text-warning-500 dark:text-warning-400 bg-warning-50 dark:bg-warning-900',
  },
};

const Toast = ({
  message,
  variant = 'info',
  onClose,
  show = true,
  duration = 5000,
}) => {
  React.useEffect(() => {
    if (show && duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden">
        <div className={variants[variant].className}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {React.createElement(variants[variant].icon, {
                  className: "h-6 w-6",
                  "aria-hidden": "true"
                })}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-secondary-900 dark:text-white">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="rounded-md inline-flex text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Đóng</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default Toast;