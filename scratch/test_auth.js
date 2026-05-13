
async function test() {
  const email = `test_login_${Date.now()}@example.com`;
  const username = `test_user_${Date.now()}`;
  const password = 'Password123';
  const baseUrl = 'https://tradealo.onrender.com/api/v1';

  console.log(`Registering ${email}...`);
  try {
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    console.log('Registration Status:', regRes.status);
    if (!regRes.ok) {
      console.log('Registration Error:', await regRes.text());
      return;
    }
  } catch (err) {
    console.error('Registration Failed:', err);
    return;
  }

  console.log(`Logging in ${email}...`);
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('Login Status:', loginRes.status);
    const data = await loginRes.json();
    if (loginRes.ok) {
      console.log('Login Success!');
      console.log('User Data:', data.user);
    } else {
      console.log('Login Error:', data);
    }
  } catch (err) {
    console.error('Login Failed:', err);
  }
}

test();
