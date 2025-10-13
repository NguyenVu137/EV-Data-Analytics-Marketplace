const axios = require('axios');
const fs = require('fs');
const base = 'http://localhost:5000';

async function ensureAdmin() {
  // Try to create admin via register, and then mark verified by patching DB via an ad-hoc endpoint if available.
  try {
    await axios.post(`${base}/auth/register`, { name: 'local-admin', email: 'local-admin@example.com', password: 'Password123!', role: 'admin' });
    console.log('Register called for local-admin (may require email verification)');
  } catch (e) {
    console.log('Register may have returned error (likely SMTP). Continuing...');
  }

  // If login fails due to email not verified, we'll attempt to create admin directly via /users POST (exists) and then login.
  try {
    const u = await axios.post(`${base}/users`, { name: 'local-admin', email: 'local-admin2@example.com', password: 'Password123!', role: 'admin' });
    console.log('Created user via /users:', u.data.email || u.data);
  } catch (e) {
    console.log('/users POST may have failed or user exists. Error:', e.response ? e.response.data : e.message);
  }
}

async function login(email) {
  try {
    const r = await axios.post(`${base}/auth/login`, { email, password: 'Password123!' });
    return r.data.token;
  } catch (e) {
    console.log('Login failed for', email, e.response ? e.response.data : e.message);
    return null;
  }
}

async function run() {
  await ensureAdmin();

  // Try both created emails
  const emails = ['local-admin@example.com', 'local-admin2@example.com'];
  let token = null;
  for (const em of emails) {
    token = await login(em);
      if (token) { break; }
  }
    if (!token) {
      console.log('Could not obtain token; ensure admin exists and is verified.');
      return;
    }

  // Call subscribe
  try {
    const r = await axios.post(`${base}/api/subscriptions/subscribe`, { tier: 'starter' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Subscribe result:', r.data.data || r.data);
  } catch (e) {
    console.error('Subscribe failed', e.response ? e.response.data : e.message);
  }

  // Call renew-now for this user
  try {
    const r = await axios.post(`${base}/api/subscriptions/renew-now`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('renew-now result:', r.data);
  } catch (e) {
    console.error('renew-now failed', e.response ? e.response.data : e.message);
  }

  // Use admin token to process due (if the token belongs to admin)
  try {
    const r = await axios.post(`${base}/api/subscriptions/process-due`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('process-due result:', r.data);
  } catch (e) {
    console.error('process-due failed', e.response ? e.response.data : e.message);
  }

  // List invoice files
  const invoicesDir = './invoices';
  if (fs.existsSync(invoicesDir)) {
    const files = fs.readdirSync(invoicesDir);
    console.log('Invoices folder files:', files);
    for (const f of files) console.log(' -', f, fs.readFileSync(`${invoicesDir}/${f}`, 'utf8').slice(0, 200));
  } else {
    console.log('No invoices folder yet (backend/invoices expected).');
  }
}

run();
