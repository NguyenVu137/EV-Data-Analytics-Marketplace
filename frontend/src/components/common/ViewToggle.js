import React from 'react';
import classNames from 'classnames';
import { ViewListIcon, ViewGridIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex rounded-lg shadow-sm">
      <Button
        variant={view === 'grid' ? 'primary' : 'secondary'}
        className={classNames(
          'rounded-r-none',
          view === 'grid' ? 'z-10' : 'hover:z-10'
        )}
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
      >
        <ViewGridIcon className="h-5 w-5" />
      </Button>
      <Button
        variant={view === 'list' ? 'primary' : 'secondary'}
        className={classNames(
          '-ml-px rounded-l-none',
          view === 'list' ? 'z-10' : 'hover:z-10'
        )}
        onClick={() => onViewChange('list')}
        aria-label="List view"
      >
        <ViewListIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ViewToggle;