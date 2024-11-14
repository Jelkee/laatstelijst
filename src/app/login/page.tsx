"use client";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Check if the user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      // If token exists, redirect to the profile page
      setIsAuthenticated(true);
      router.push("/profile"); // Redirect to profile page
    }
    // Trigger snowflakes animation on page load
    createSnowflakes();
  }, [router]);

  // Handle successful login
  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (idToken) {
      setLoading(true);
      fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("User authenticated:", data);
          // Save JWT token in localStorage
          localStorage.setItem("jwt", data.token);
          setIsAuthenticated(true); // Set authenticated state
          setLoading(false);
          router.push("/profile");  // Redirect to profile page after successful login
        })
        .catch((err) => {
          console.error("Login failed:", err);
          setError("An error occurred during login. Please try again.");
          setLoading(false);
        });
    }
  };

  // Handle login failure
  const handleLoginFailure = (error: any) => {
    console.log("Login failed:", error);
    setError("Login failed. Please try again.");
  };

  // Handle logout
  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem("jwt");
    setIsAuthenticated(false); // Reset authenticated state
    router.push("/"); // Redirect to home page or login page after logout
  };

  // Function to create and animate snowflakes randomly (called once on page load)
  const createSnowflakes = () => {
    const numberOfSnowflakes = 30; // Number of snowflakes
    const snowflakeContainer = document.getElementById("snowflakes-container");

    if (snowflakeContainer) {
      // Clear any existing snowflakes before adding new ones
      snowflakeContainer.innerHTML = '';

      for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");

        // Randomize position, size, and animation
        const size = Math.random() * 10 + 5; // Snowflake size (5-15px)
        const positionX = Math.random() * 100; // Random horizontal position (0-100%)
        const animationDuration = Math.random() * 5 + 5; // Snowflake animation duration (5-10 seconds)
        const delay = Math.random() * 5; // Random animation delay (0-5 seconds)

        // Apply styles to the snowflake element
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${positionX}%`;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationDelay = `${delay}s`;

        // Append snowflake to the container
        snowflakeContainer.appendChild(snowflake);
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black flex flex-col justify-center items-center text-white relative overflow-hidden">
        {/* Snowflakes Effect */}
        <div
          id="snowflakes-container"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        ></div>

        {/* New Year Header */}
        <div className="text-center mb-8 animate__animated animate__fadeIn animate__delay-1s">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-600">
            🎆 Happy New Year 2024! 🎆
          </h1>
          <p className="mt-2 text-xl font-medium">Welcome to a magical new year!</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-8 shadow-lg w-full max-w-md transform transition duration-500 hover:scale-105 relative z-10">
          {!isAuthenticated ? (
            <>
              {loading ? (
                <div className="flex justify-center items-center">
                    <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <GoogleLoginButton
                    onLoginSuccess={handleLoginSuccess}
                    onLoginFailure={handleLoginFailure}
                  />
                </div>
              )}
              {error && <p className="mt-4 text-red-600">{error}</p>}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">You are now part of 2024!</h2>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-200">
          <p>Made with ❤️ by Jelke</p>
        </footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Page;
