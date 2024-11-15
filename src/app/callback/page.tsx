'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Callback = () => {
  const [isClient, setIsClient] = useState(false); // To ensure the client-side only executes the logic
  const [error, setError] = useState<string | null>(null); // To store error messages if any
  const router = useRouter(); // For navigation

  useEffect(() => {
    setIsClient(true); // Only run this on the client side
  }, []);

  useEffect(() => {
    if (isClient) {
      const token = new URLSearchParams(window.location.search).get('credential'); // Extract the ID token from the URL

      if (token) {
        // Send the token to the backend for verification
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: token }), // Send the token in the request body
        })
          .then((res) => res.json()) // Parse the response
          .then((data) => {
            if (data.token) {
              // If a token is returned from the server, store it in localStorage and redirect to profile
              localStorage.setItem('token', data.token);
              router.push('/profile'); // Redirect to the profile page
            } else {
              // Handle authentication failure
              console.error('Authentication failed:', data.error);
              setError('Authentication failed: ' + (data.error || 'Unknown error'));
              router.push('/login'); // Redirect to login if authentication fails
            }
          })
          .catch((error) => {
            console.error('Error during authentication:', error);
            setError('An error occurred during authentication.');
            router.push('/login'); // Redirect to login in case of error
          });
      } else {
        // Handle case where no token is found
        setError('No token found in URL.');
        router.push('/login'); // Redirect to login if no token is present
      }
    }
  }, [isClient, router]);

  return (
    <div>
      {error ? (
        <p>{error}</p> // Display the error message if any
      ) : (
        <p>Loading...</p> // Show loading text while waiting for the process
      )}
    </div>
  );
};

export default Callback;
