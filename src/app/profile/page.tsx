"use client";
import { Group, User } from "@/app/types"; // Import the types
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true); // Start loading

        // Check if we are on the client side before accessing localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

        if (!token) {
          setError("You must be logged in to view your profile");
          setLoading(false);
          return;
        }

        // Fetch user profile and groups via a new API route instead of calling server functions directly
        const [userData, userGroups] = await Promise.all([
          fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
          fetch("/api/groups", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
        ]);

        setLoading(false); // Stop loading
        setUser(userData);
        setGroups(userGroups);
      } catch (err) {
        setError("Failed to fetch profile data");
        setLoading(false); // Stop loading on error
      }
    };

    fetchProfileData(); // Call the function to fetch profile and groups data
  }, []); // Empty dependency array to run this only once after the component mounts

  const handleJoinGroup = async (groupId: string) => {
    try {
      setError(null); // Clear any previous error

      if (!groupId) {
        setError("Invalid Group ID");
        return;
      }

      // Check for client-side execution before accessing localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

      if (!token) {
        setError("You must be logged in to join a group");
        return;
      }

      // Call the API endpoint for joining the group instead of using a server function directly
      const response = await fetch("/api/joinGroup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        throw new Error("Failed to join group");
      }

      setGroups((prevGroups) => [
        ...prevGroups,
        { id: groupId, name: `Group ${groupId}` }, // Add the new group to the list
      ]);
    } catch (err) {
      console.error(err);
      setError("Error joining the group");
    }
  };

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-900">Your Profile</h1>

      {user ? (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700">Profile Information</h2>
          <p className="mt-2 text-lg text-gray-600">Name: {user.givenName} {user.familyName}</p>
          <p className="mt-1 text-lg text-gray-600">Email: {user.email}</p>
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-600">Loading your profile...</p>
      )}

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700">Your Groups</h2>
        {groups.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {groups.map((group) => (
              <li key={group.id} className="flex justify-between items-center text-lg text-gray-700">
                <a href={`/group/${group.id}`} className="text-blue-600 hover:underline">
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-gray-600">You are not in any groups yet.</p>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700">Join a Group</h3>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Enter Group ID"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleJoinGroup(newGroup)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
