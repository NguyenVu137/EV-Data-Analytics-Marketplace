import React from 'react';

const plans = [
  { tier: 'Free', price: 0, quotaDownloads: 1, quotaAPI: 1000, features: ['100 sample rows', 'API 1k calls/mo'] },
  { tier: 'Starter', price: 29, quotaDownloads: 50, quotaAPI: 50000, features: ['50 GB downloads', '50k API calls'] },
  { tier: 'Business', price: 299, quotaDownloads: 500, quotaAPI: 500000, features: ['500 GB', '500k calls', 'Basic support'] },
  { tier: 'Enterprise', price: 'Custom', quotaDownloads: 5000, quotaAPI: 5000000, features: ['SLA', 'SSO', 'Bulk discounts'] },
];

const SubscriptionPlans = () => {
  return (
    <div className="subscription-plans">
      <h2>So sánh các gói thuê bao</h2>
      <table>
        <thead>
          <tr>
            <th>Gói</th><th>Giá</th><th>Quota Download</th><th>Quota API</th><th>Quyền lợi</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => (
            <tr key={plan.tier}>
              <td>{plan.tier}</td>
              <td>{plan.price === 0 ? 'Miễn phí' : plan.price === 'Custom' ? 'Liên hệ' : `$${plan.price}/tháng`}</td>
              <td>{plan.quotaDownloads}</td>
              <td>{plan.quotaAPI}</td>
              <td>{plan.features.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="subscribe-btn">Đăng ký gói Starter</button>
    </div>
  );
};

export default SubscriptionPlans;
