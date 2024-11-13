'use client'; // Mark this as a Client Component

import GoogleLoginButton from '@/components/GoogleLoginButton';

const Home = () => {
  const handleLoginSuccess = (response: { credential: any; }) => {
    console.log("Login successful:", response);
    const idToken = response.credential; // ID token for verification
    fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('User authenticated:', data);
      });
  };

  const handleLoginFailure = (error: any) => {
    console.log("Login failed:", error);
  };

  return (
    <div>
      <h1>Google Login with Next.js</h1>
      <GoogleLoginButton
        onLoginSuccess={handleLoginSuccess}
        onLoginFailure={handleLoginFailure}
      />
    </div>
  );
};

export default Home;
