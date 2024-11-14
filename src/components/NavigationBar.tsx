"use client";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";
import { UserNav } from "./user-nav";

const NavigationBar = () => {
  const [sessionStatus, setSessionStatus] = useState<boolean | null>(null);  // Track session status
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState<string | null>(null);  // Track any errors
  const [user, setUser] = useState<{ givenName: string, email: string } | null>(null);  // Track user info

  useEffect(() => {
    // Function to check session status via the API
    async function checkSession() {
      const token = localStorage.getItem("jwt"); // Retrieve JWT token stored in localStorage

      if (!token) {
        setSessionStatus(false); // No token, user is not authenticated
        setLoading(false); // Stop loading
        return;
      }

      try {
        // Make a request to the server to check the session
        const response = await fetch("/api/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,  // Attach token to the request
          },
        });

        // Handle API response
        const data = await response.json();

        if (response.ok) {
          setSessionStatus(data.authenticated); // Set session status based on response
          
          // Fetch user details if authenticated
          if (data.authenticated) {
            const userResponse = await fetch("/api/user", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const userData = await userResponse.json();
            if (userResponse.ok) {
              setUser(userData); // Set user data
              console.log(userData);
            } else {
              setError("Failed to fetch user details");
            }
          }
        } else {
          setSessionStatus(false); // Token is invalid or expired
        }
      } catch (err) {
        setError("Failed to check session status"); // Set error if fetch fails
        setSessionStatus(false); // Default to false if there's an error
      } finally {
        setLoading(false); // Stop loading after the request is completed
      }
    }

    checkSession(); // Call the checkSession function when component mounts
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16 bg-blue-600 text-white">
        <span>Loading...</span> {/* You can replace this with a spinner */}
      </div>
    ); // Show a loading message or spinner
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-16 bg-red-600 text-white">
        <span>{error}</span> {/* Show error message */}
      </div>
    );
  }

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="text-xl font-semibold">MyApp</div>
        <NavigationMenu>
          <NavigationMenuList className="flex space-x-4">
            {!sessionStatus ? (
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/login"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition duration-300"
                >
                  Login
                </NavigationMenuLink>
              </NavigationMenuItem>
            ) : (
              user && (
                <UserNav name={user.givenName} email={user.email} />
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default NavigationBar;
