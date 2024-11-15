import "@/app/styles/login.css";
import NavigationBar from '@/components/NavigationBar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ReactNode } from 'react';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Metadata for your app (title, description)
export const metadata: Metadata = {
  title: "LaatsteLijst",
  description: "",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  if (!clientId) {
    console.error("Google Client ID is missing. Check your environment variables.");
    return null;
  }

  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-indigo-900 to-black text-white">
        <GoogleOAuthProvider clientId={clientId}>
          <NavigationBar />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
