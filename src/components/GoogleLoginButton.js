// components/GoogleLoginButton.js
'use client'; // This makes the component a Client Component

import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onLoginSuccess, onLoginFailure }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleLogin
      onSuccess={onLoginSuccess}
      onError={onLoginFailure}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
