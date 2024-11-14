"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Trigger snowflakes animation on page load
    createSnowflakes();

    // Cleanup snowflakes interval on component unmount
    return () => {
      const snowflakeContainer = document.getElementById("snowflakes-container");
      if (snowflakeContainer) {
        snowflakeContainer.innerHTML = '';  // Remove snowflakes when component unmounts
      }
    };
  }, []);

  // Function to create and animate snowflakes randomly
  const createSnowflakes = () => {
    const numberOfSnowflakes = 20; // Number of snowflakes
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Snowflakes Effect */}
      <div
        id="snowflakes-container"
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      ></div>

      {/* Music-Themed Header */}
      <div className="text-center mb-8 animate__animated animate__fadeIn animate__delay-1s">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-600">
          🎶 Laatste Lijst 🎶
        </h1>
      </div>

      {/* Main Content */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-8 shadow-lg w-full max-w-md transform transition duration-500 hover:scale-105 relative z-10 text-center">
        <h2 className="text-3xl font-semibold text-gray-200">Build Your Playlist Together</h2>
        <p className="mt-4 text-lg text-gray-300">
          Share your favorite songs and create a collaborative playlist with your friends. The more the merrier!
        </p>

        {/* Example of the Music Theme with Icons */}
        <div className="mt-6 flex justify-center items-center space-x-6 text-4xl text-gray-300">
          <div className="hover:text-yellow-400 transition duration-300">
            <i className="fas fa-headphones-alt"></i>
          </div>
          <div className="hover:text-pink-400 transition duration-300">
            <i className="fas fa-music"></i>
          </div>
          <div className="hover:text-blue-400 transition duration-300">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-200">
        <p>Made with ❤️ by Jelke</p>
      </footer>
    </div>
  );
}
