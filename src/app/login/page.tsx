"use client";
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';

const Page: React.FC = () => {
  // Handle successful login
  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (idToken) {
      fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('User authenticated:', data);
          // Save JWT token in localStorage
          localStorage.setItem('jwt', data.token);
        });
    }
  };
  

  // Handle login failure
  const handleLoginFailure = (error: any) => {
    console.log("Login failed:", error);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div>
        <h1>Google Login with Next.js</h1>
        <GoogleLoginButton
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Page;
