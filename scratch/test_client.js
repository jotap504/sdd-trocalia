const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://tradealo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (res) => {
    console.log('Interceptor input res.data:', JSON.stringify(res.data));
    if (res.data && res.data.success === true && res.data.data !== undefined) {
      const newRes = { ...res, data: res.data.data };
      console.log('Interceptor output res.data:', JSON.stringify(newRes.data));
      return newRes;
    }
    return res;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

async function post(url, body) {
  const r = await apiClient.post(url, body);
  return r.data;
}

async function test() {
  const email = `test_login_${Date.now()}@test.com`;
  const password = 'Password123';
  
  await post('/auth/register', { email, password, username: 'test_user' });
  
  try {
    const res = await post('/auth/login', { email, password });
    console.log('Final post() result:', res);
    console.log('res.user exists?', !!res.user);
  } catch(e) {
    console.error('Failed', e.response?.data);
  }
}

test();
