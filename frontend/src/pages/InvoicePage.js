import React from 'react';

const invoices = [
  { id: 1, amount: 29, status: 'paid', issuedAt: '2025-10-01', pdfUrl: '#' },
  { id: 2, amount: 299, status: 'pending', issuedAt: '2025-09-01', pdfUrl: '#' },
];

const InvoicePage = () => {
  return (
    <div className="invoice-page">
      <h2>Hóa đơn của bạn</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày phát hành</th><th>PDF</th></tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.amount}₫</td>
              <td>{inv.status}</td>
              <td>{inv.issuedAt}</td>
              <td><a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">Tải PDF</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicePage;
