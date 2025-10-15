import React, { useState, useEffect } from 'react';
import { DatasetGridView, DatasetListView } from './DatasetViews';
import ViewToggle from './ViewToggle';
import { useToast } from '../contexts/ToastContext';
import Skeleton from './common/Skeleton';
import SearchInput from './common/SearchInput';
import Select from './common/Select';
import Button from './common/Button';

const DatasetExplorer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        const response = await fetch('/api/datasets');
        const data = await response.json();
        setDatasets(data);
        
        const categoryResponse = await fetch('/api/categories');
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);
      } catch (error) {
        showToast('Không thể tải dữ liệu. Vui lòng thử lại sau.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement search logic
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // TODO: Implement category filtering
  };

  const handleDatasetSelect = (dataset) => {
    // TODO: Implement dataset selection/navigation
    console.log('Selected dataset:', dataset);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:w-auto flex-1">
          <SearchInput
            placeholder="Tìm kiếm bộ dữ liệu..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-auto flex gap-4 items-center">
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={[
              { value: '', label: 'Tất cả danh mục' },
              ...categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))
            ]}
            className="w-full sm:w-48"
          />
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
            className="hidden sm:flex"
          />
        </div>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
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
          <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">
            Không tìm thấy dữ liệu
          </h3>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Không có bộ dữ liệu nào phù hợp với tiêu chí tìm kiếm.
          </p>
          <div className="mt-6">
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}>
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <DatasetGridView datasets={datasets} onSelect={handleDatasetSelect} />
      ) : (
        <DatasetListView datasets={datasets} onSelect={handleDatasetSelect} />
      )}
    </div>
  );
};

export default DatasetExplorer;