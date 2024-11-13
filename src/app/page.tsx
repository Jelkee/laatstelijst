"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [sessionStatus, setSessionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Call the API to check session status
    async function checkSession() {
      // Retrieve JWT token from localStorage
      const token = localStorage.getItem('jwt');  // Get the JWT token stored after login
      
      if (!token) {
        setSessionStatus(false);  // If no token found, assume not logged in
        return;
      }

      // Make the request to check session status
      const response = await fetch('/api/session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Include the JWT in the Authorization header
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSessionStatus(data.authenticated);  // Update session status if token is valid
      } else {
        setSessionStatus(false);  // Not authenticated
      }
    }

    checkSession();
  }, []);

  return (
    <div>
      <h1>Welcome to the homepage!</h1>
      {sessionStatus === null ? (
        <p>Loading...</p>
      ) : sessionStatus ? (
        <p>You are logged in!</p>
      ) : (
        <p>You are not logged in!</p>
      )}
    </div>
  );
}
