import React, { useState } from 'react';

const APIAccessPage = () => {
  const [apiKey] = useState('sk-xxxxxx-demo'); // TODO: fetch from backend
  const [quota, setQuota] = useState(1000); // TODO: fetch from backend
  const [used, setUsed] = useState(100); // TODO: fetch from backend

  return (
    <div className="api-access-page">
      <h2>API Access</h2>
      <div><b>API Key:</b> <code>{apiKey}</code></div>
      <div><b>Quota:</b> {used} / {quota} requests</div>
      <h3>SDK Snippet</h3>
      <pre>{`curl -H "x-api-key: ${apiKey}" https://api.example.com/v1/data`}</pre>
      <button>Gia hạn quota</button>
    </div>
  );
};

export default APIAccessPage;
