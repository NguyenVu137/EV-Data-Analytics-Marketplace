import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import api from '../lib/api-client';
import config from '../config';
import DatasetDetailModal from '../components/DatasetDetailModal';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  const fetchTransactions = React.useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/transactions/consumer/${user.id}`);
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <CardContent className="text-center py-12">
          <Alert variant="warning" title="Yêu cầu đăng nhập">
            Vui lòng đăng nhập để xem lịch sử giao dịch.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <Loader fullscreen text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Lịch sử giao dịch
          </h1>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Xem và quản lý các giao dịch của bạn
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={fetchTransactions}
            leftIcon={
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            }
          >
            Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Lỗi" 
          className="mb-6"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900 dark:text-white">
                Chưa có giao dịch
              </h3>
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                Bạn chưa thực hiện giao dịch nào.
              </p>
            </CardContent>
          </Card>
        ) : (
          transactions.map((tr) => (
            <Card key={tr.id} hover>
              <div className="flex items-center justify-between p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-secondary-900 dark:text-white truncate">
                        {tr.Dataset?.title || 'Dataset Purchase'}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4">
                        <StatusBadge 
                          status={tr.status === 'completed' ? 'completed' : 'pending'} 
                        />
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">
                          {format(new Date(tr.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      {tr.Dataset?.pricingType && (
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {tr.Dataset.pricingType}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-lg font-medium text-success-600">
                        {tr.amount.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-4">
                    {tr.Dataset?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDatasetId(tr.Dataset.id)}
                      >
                        Xem chi tiết Dataset
                      </Button>
                    )}
                    {tr.Invoice && (
                      <Button
                        variant="secondary"
                        size="sm"
                        as="a"
                        href={`${config.backendUrl}/api/transactions/invoices/${tr.Invoice.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Xem hóa đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedDatasetId && (
        <DatasetDetailModal 
          datasetId={selectedDatasetId} 
          onClose={() => setSelectedDatasetId(null)} 
        />
      )}
    </div>
  );
};

export default TransactionHistoryPage;