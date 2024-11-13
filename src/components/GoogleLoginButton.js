// components/GoogleLoginButton.js
'use client';

import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onLoginSuccess, onLoginFailure }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error("Google Client ID is missing. Check your environment variables.");
    return null;
  }

  return (
    <GoogleLogin
      clientId={clientId}         // Make sure clientId is passed here
      onSuccess={onLoginSuccess}
      onError={onLoginFailure}
      useOneTap                    // Optional: prompts users to sign in
    />
  );
};

export default GoogleLoginButton;
