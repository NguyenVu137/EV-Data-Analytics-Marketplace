import React from 'react';
import Button from './common/Button';
import Card from './common/Card';
import Badge from './common/Badge';
import { formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

export const DatasetGridView = ({ datasets, onSelect }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {datasets.map((dataset) => (
      <Card 
        key={dataset.id} 
        className="h-full hover:shadow-lg transition-shadow duration-200"
        onClick={() => onSelect(dataset)}
      >
        {dataset.thumbnail ? (
          <img
            src={dataset.thumbnail}
            alt={dataset.title}
            className="h-48 w-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="h-48 bg-secondary-100 dark:bg-secondary-800 rounded-t-lg flex items-center justify-center">
            <svg
              className="h-12 w-12 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
            {dataset.title}
          </h3>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400 line-clamp-2">
            {dataset.description}
          </p>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {dataset.categories?.map((category, index) => (
                <Badge key={`${dataset.id}-${category}-${index}`} variant="secondary" size="sm">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                Cập nhật{' '}
                {formatDistance(new Date(dataset.updatedAt), new Date(), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            <Button size="sm" onClick={() => onSelect(dataset)}>
              Chi tiết
            </Button>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const DatasetListView = ({ datasets, onSelect }) => (
  <div className="space-y-4">
    {datasets.map((dataset) => (
      <Card
        key={dataset.id}
        className="hover:shadow-lg transition-shadow duration-200"
        onClick={() => onSelect(dataset)}
      >
        <div className="flex">
          {dataset.thumbnail ? (
            <img
              src={dataset.thumbnail}
              alt={dataset.title}
              className="h-32 w-32 object-cover rounded-l-lg"
            />
          ) : (
            <div className="h-32 w-32 bg-secondary-100 dark:bg-secondary-800 rounded-l-lg flex items-center justify-center">
              <svg
                className="h-8 w-8 text-secondary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
          )}

          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                  {dataset.title}
                </h3>
                <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400 line-clamp-2">
                  {dataset.description}
                </p>
              </div>
              <Button size="sm" onClick={() => onSelect(dataset)}>
                Chi tiết
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {dataset.categories?.map((category, index) => (
                  <Badge key={`${dataset.id}-${category}-${index}`} variant="secondary" size="sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-secondary-500 dark:text-secondary-400">
              <span>
                Cập nhật{' '}
                {formatDistance(new Date(dataset.updatedAt), new Date(), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{dataset.size || 'N/A'}</span>
              <span className="mx-2">•</span>
              <span>{dataset.format || 'N/A'}</span>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);