// pages/callback.tsx

import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    // Get the "credential" token from the URL (from Google)
    const token = router.query.credential as string;

    if (token) {
      // Send the token to your backend for verification and login
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            // Store the JWT token (or handle as needed, e.g., in cookies/local storage)
            localStorage.setItem('token', data.token);

            // Redirect the user to a logged-in page, like the dashboard or home
            router.push('/dashboard');
          } else {
            console.error('Authentication failed:', data.error);
            // Redirect to login with an error message (or handle error feedback)
            router.push('/login?error=authentication_failed');
          }
        })
        .catch((error) => {
          console.error('Error during authentication:', error);
          router.push('/login?error=server_error');
        });
    } else {
      // If no token, redirect to login
      router.push('/login?error=missing_token');
    }
  }, [router.query]);

  return <div>Loading...</div>;
};

export default Callback;
