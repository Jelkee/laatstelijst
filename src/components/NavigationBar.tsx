"use client";
import { HomeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";
import { UserNav } from "./user-nav";

const NavigationBar = () => {
  const [sessionStatus, setSessionStatus] = useState<boolean | null>(null);  // Track session status
  const [error, setError] = useState<string | null>(null);  // Track any errors
  const [user, setUser] = useState<{ givenName: string, email: string } | null>(null);  // Track user info

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("jwt"); // Retrieve JWT token stored in localStorage

      if (!token) {
        setSessionStatus(false); // No token, user is not authenticated
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
      }
    }

    checkSession(); // Call the checkSession function when component mounts
  }, []);

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
        <NavigationMenu>
          {/* Left-side Navigation Links */}
          <NavigationMenuList className="flex items-center space-x-6">
            <div className="bg-white relative h-8 w-8 rounded-full flex items-center justify-center">
              <NavigationMenuLink href="/" className="h-8 w-8 flex items-center justify-center">
                <HomeIcon className="h-6 w-6 text-black" />
              </NavigationMenuLink>
            </div>
            {/* You can add other left-side navigation links here */}
          </NavigationMenuList>

          {/* Right-side User Authentication Links */}
          <NavigationMenuList className="flex items-center space-x-4 ml-auto">
            {!sessionStatus ? (
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/login"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-105"
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
