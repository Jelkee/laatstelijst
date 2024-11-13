// app/layout.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

// Set the Google Client ID from the environment variable
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const metadata = {
  title: 'Laatste Lijst',
  description: 'Leuke Liedjes Luisteren',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  if (!clientId) {
    console.error("Google Client ID is missing. Check your environment variables.");
    return null;
  }

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
