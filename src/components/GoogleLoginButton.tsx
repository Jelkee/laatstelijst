"use client";

import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onLoginSuccess: (response: CredentialResponse) => void;
  onLoginFailure?: (error: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess, onLoginFailure }) => {
  return (
    <GoogleLogin
      onSuccess={onLoginSuccess}
      onError={() => { // Changed to no argument function
        console.error("Login Error");
        if (onLoginFailure) {
          // Call the failure handler if provided
          onLoginFailure("Login failed"); // or you can pass an error message or custom error
        }
      }}
    />
  );
};

export default GoogleLoginButton;
