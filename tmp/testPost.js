const http = require('http');

const data = JSON.stringify({ credential: 'fake-token', username: 'testuser123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/auth/google/username',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
  timeout: 10000,
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.on('timeout', () => {
  console.error('request timed out');
  req.destroy();
});
req.write(data);
req.end();
