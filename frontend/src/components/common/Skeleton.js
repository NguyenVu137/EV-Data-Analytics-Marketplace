import React from 'react';
import Card from './Card';
import { LoaderOverlay } from './Loader';

const SkeletonCard = () => (
  <Card className="h-full">
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-secondary-200 dark:bg-secondary-700 rounded" />
      <div className="space-y-3">
        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
        <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
        <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-20 bg-secondary-200 dark:bg-secondary-700 rounded" />
        <div className="h-8 w-8 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
      </div>
    </div>
  </Card>
);

export const DatasetGridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array(count).fill(0).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const DatasetListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array(count).fill(0).map((_, i) => (
      <Card key={i} className="w-full">
        <div className="animate-pulse flex space-x-4">
          <div className="h-32 w-32 bg-secondary-200 dark:bg-secondary-700 rounded" />
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded" />
              <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-5/6" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-8 w-20 bg-secondary-200 dark:bg-secondary-700 rounded" />
              <div className="h-8 w-8 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);