// src/app/callback/page.tsx

'use client';  // Ensure the component is client-side

import { useRouter } from 'next/navigation'; // Use next/navigation for client-side routing
import { useEffect, useState } from 'react';

const Callback = () => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter(); // This now uses next/navigation

  useEffect(() => {
    // Ensure this code runs only on the client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Get the "credential" token from the URL (from Google)
      const token = new URLSearchParams(window.location.search).get('credential');

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
              router.push('/profile');
            } else {
              console.error('Authentication failed:', data.error);
              // Redirect to login with an error message (or handle error feedback)
              router.push('/login');
            }
          })
          .catch((error) => {
            console.error('Error during authentication:', error);
            router.push('/login');
          });
      } else {
        // If no token, redirect to login
        router.push('/login');
      }
    }
  }, [isClient, router]);

  return <div>Loading...</div>;
};

export default Callback;
