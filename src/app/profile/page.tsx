"use client";
import { Group, User } from "@/app/types"; // Import the types
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<string>(""); // Track input for group ID
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true); // Start loading

        const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

        if (!token) {
          setError("You must be logged in to view your profile");
          setLoading(false);
          return;
        }

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

      const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

      if (!token) {
        setError("You must be logged in to join a group");
        return;
      }

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
    return <div className="text-center text-lg text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h">
      <h1 className="text-3xl font-semibold text-center text-white mb-8">Your Profile</h1>

      {user ? (
        <div className="bg-gray-800 text-white shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Profile Information</h2>
          <p className="text-lg text-gray-400">Name: {user.givenName} {user.familyName}</p>
          <p className="text-lg text-gray-400">Email: {user.email}</p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading your profile...</p>
      )}

      <div className="bg-gray-800 text-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Your Groups</h2>
        {groups.length > 0 ? (
          <ul className="space-y-4">
            {groups.map((group) => (
              <li key={group.id} className="flex justify-between items-center text-lg text-gray-300">
                <a href={`/group/${group.id}`} className="text-blue-400 hover:text-blue-500 transition-all duration-300">
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You are not in any groups yet.</p>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-300">Join a Group</h3>
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Enter Group ID"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
            />
            <button
              onClick={() => handleJoinGroup(newGroup)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
