const axios = require('axios');
const base = 'http://localhost:5000';

async function run() {
  try {
  console.log('Ensuring admin user exists...');
    // Create admin - note: auth.register will try to send email; it may fail if SMTP not configured. We'll create user directly via DB if API fails.
    try {
      await axios.post(`${base}/auth/register`, { name: 'admin-test', email: 'admin-test@example.com', password: 'Password123!', role: 'admin' });
    console.log('Register API returned (may require verification)');
    } catch (e) {
    console.log('Register may have returned error (likely SMTP). Proceeding...');
    }

    // Try login (will fail if email not verified) - fallback: call DB to mark verified is required, but for simplicity we try login and report
  console.log('Attempting login...');
    try {
      const r = await axios.post(`${base}/auth/login`, { email: 'admin-test@example.com', password: 'Password123!' });
  console.log('Login success:', !!r.data.token);
    } catch (e) {
  console.log('Login failed (may be unverified).');
    }

  console.log('NOTE: If auth flow requires email verification, please verify the user in DB or use an existing admin to test endpoints.');
    console.log('You can instead call: POST /api/subscriptions/process-due with an existing admin token to process renewals.');
  } catch (err) {
    console.error('Quick test failed', err.message);
  }
}

run();
