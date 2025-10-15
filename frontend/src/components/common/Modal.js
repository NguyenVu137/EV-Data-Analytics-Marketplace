import React from 'react';
import { Portal } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  fullScreenOnMobile = false,
}) => {
  const contentRef = React.useRef(null);

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-full sm:m-4',
  };

  // Close on ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <Portal>
      <Transition show={isOpen}>
        {/* Overlay */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                ref={contentRef}
                className={`
                  relative transform overflow-hidden rounded-lg bg-white dark:bg-secondary-900 text-left 
                  shadow-xl transition-all w-full
                  ${fullScreenOnMobile ? 'h-screen sm:h-auto' : ''}
                  ${fullScreenOnMobile ? 'm-0 sm:m-4' : 'm-4'}
                  ${sizes[size]}
                `}
              >
                {/* Header */}
                {title && (
                  <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                        {title}
                      </h3>
                      {showCloseButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClose}
                          className="-mr-2"
                          aria-label="Đóng"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className={`px-6 py-4 ${fullScreenOnMobile ? 'h-[calc(100vh-144px)] sm:h-auto overflow-y-auto' : ''}`}>
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700">
                    {footer}
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </Portal>
  );
};

export default Modal;