const axios = require('axios');

(async function(){
  try{
  const { data: loginData } = await axios.post('http://localhost:5000/auth/login', { email:'local-admin@example.com', password:'Password123!' });
  const { token } = loginData;
  console.log('token len=', token && token.length);
  const inv = await axios.get('http://localhost:5000/api/subscriptions/invoices', { headers: { Authorization: 'Bearer ' + token } });
    console.log('invoices:', JSON.stringify(inv.data, null, 2));
  }catch(e){
    console.error(e.response?e.response.data:e.message);
  }
})();
