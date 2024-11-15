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
      onError={() => { // Function that does not take any arguments
        console.error("Login Error occurred");
        if (onLoginFailure) {
          onLoginFailure("Login failed"); // You can pass a custom error message
        }
      }}
    />
  );
};

export default GoogleLoginButton;
