"use client";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUserProfile, joinGroup } from './profileBackend';

interface UserProfile {
  id: string;
  givenName: string;
  familyName: string;
  email: string | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
}

interface Group {
  id: string;
  name: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null); // Initialize as null to handle loading state
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state as string or null
  const [newGroup, setNewGroup] = useState<string>(''); // Change to string for better input validation

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('jwt') || '';

        if (!token) {
          setError('You must be logged in to view your profile');
          return;
        }

        const { user, groups } = await getUserProfile(token);
        setUser(user);
        setGroups(groups);
      } catch (err) {
        setError('Failed to fetch profile data or invalid token');
      }
    };

    fetchProfileData();
  }, []);

  // Function to handle the joining of a new group
  const handleJoinGroup = async (groupId: string) => {
    try {
      if (!groupId) {
        setError('Invalid Group ID');
        return;
      }

      const token = localStorage.getItem('jwt') || '';

      if (!token) {
        setError('You must be logged in to join a group');
        return;
      }

      setError(null); // Clear any previous errors

      await joinGroup(groupId, token); // Ensure the group ID is passed as a number
      setGroups((prevGroups) => [
        ...prevGroups,
        { id: groupId, name: `Group ${groupId}` }, // Simulate adding the group to the list
      ]);
    } catch (error) {
      setError('Error joining the group');
    }
  };

  if (error) {
    return <div className="error">{error}</div>; // Show error message in a styled div
  }

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {user ? (
        <div className="profile-info">
          <p>Name: {user.givenName} {user.familyName}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading your profile...</p>
      )}

      <div className="groups-list">
        <h2>Your Groups</h2>
        {groups.length > 0 ? (
          <ul>
            {groups.map((group) => (
              <li key={group.id}>
                <a href={`/group/${group.id}`}>{group.name}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>You are not in any groups yet.</p>
        )}

        <div className="join-group">
          <h3>Join a Group</h3>
          <input
            type="text"
            placeholder="Enter Group ID"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
          <Button onClick={() => handleJoinGroup(newGroup)}>Join</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
