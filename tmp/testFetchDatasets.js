const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/datasets/search',
  method: 'GET',
  timeout: 10000
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try { const j = JSON.parse(body); console.log('BODY:', JSON.stringify(j, null, 2)); }
    catch (e) { console.log('BODY (raw):', body); }
  });
});
req.on('error', (e) => console.error('ERR', e.message));
req.end();
