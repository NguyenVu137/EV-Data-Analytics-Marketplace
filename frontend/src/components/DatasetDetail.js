import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Badge from './common/Badge';
import Card from './common/Card';
import { useToast } from '../contexts/ToastContext';
import Skeleton from './common/Skeleton';

const DatasetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/datasets/${id}`);
        const data = await response.json();
        setDataset(data);
      } catch (error) {
        showToast('Không thể tải thông tin bộ dữ liệu. Vui lòng thử lại sau.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [id, showToast]);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // TODO: Replace with actual subscription logic
      await fetch(`/api/datasets/${id}/subscribe`, {
        method: 'POST',
      });
      showToast('Đăng ký sử dụng bộ dữ liệu thành công!', 'success');
    } catch (error) {
      showToast('Không thể đăng ký sử dụng. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <Card>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">
          Không tìm thấy bộ dữ liệu
        </h3>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Bộ dữ liệu này không tồn tại hoặc đã bị xóa.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/datasets')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          {dataset.title}
        </h1>
        <Button variant="outline" onClick={() => navigate('/datasets')}>
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {dataset.thumbnail && (
            <img
              src={dataset.thumbnail}
              alt={dataset.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          <div className="prose dark:prose-invert max-w-none">
            <h2>Mô tả</h2>
            <p>{dataset.description}</p>

            <h2>Thông số kỹ thuật</h2>
            <ul>
              <li>Định dạng: {dataset.format}</li>
              <li>Kích thước: {dataset.size}</li>
              <li>Số lượng bản ghi: {dataset.recordCount}</li>
              <li>Cập nhật lần cuối: {new Date(dataset.updatedAt).toLocaleDateString('vi-VN')}</li>
            </ul>

            {dataset.sampleData && (
              <>
                <h2>Dữ liệu mẫu</h2>
                <pre className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(dataset.sampleData, null, 2)}
                </pre>
              </>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium text-secondary-900 dark:text-white mb-4">
              Danh mục
            </h2>
            <div className="flex flex-wrap gap-2">
              {dataset.categories?.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                Thông tin gói dữ liệu
              </h3>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                {dataset.pricingDescription || 'Liên hệ để biết thêm chi tiết về giá.'}
              </p>
            </div>

            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
              <ul className="space-y-3">
                {dataset.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-sm text-secondary-700 dark:text-secondary-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubscribe}
              loading={isSubscribing}
            >
              Đăng ký sử dụng
            </Button>

            <p className="text-xs text-center text-secondary-500 dark:text-secondary-400">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <a href="/terms" className="text-primary-600 hover:text-primary-500">
                điều khoản sử dụng
              </a>
              {' '}của chúng tôi.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DatasetDetail;