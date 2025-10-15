import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { CheckIcon } from '@heroicons/react/outline';

const Select = ({ value, onChange, options, className = '' }) => {
  const selected = options.find(option => option.value === value) || options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        <Listbox.Button className="relative w-full bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          <span className="block truncate text-secondary-900 dark:text-white">
            {selected.label}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon
              className="h-5 w-5 text-secondary-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `${
                    active
                      ? 'text-white bg-primary-600'
                      : 'text-secondary-900 dark:text-white'
                  } cursor-pointer select-none relative py-2 pl-3 pr-9`
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={`${
                        selected ? 'font-semibold' : 'font-normal'
                      } block truncate`}
                    >
                      {option.label}
                    </span>

                    {selected && (
                      <span
                        className={`${
                          active ? 'text-white' : 'text-primary-600'
                        } absolute inset-y-0 right-0 flex items-center pr-4`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Select;