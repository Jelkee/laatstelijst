"use client";
import { Song } from "@/app/types";
import { FloatingLoaderSpinner } from "@/components/FloatingLoaderSpinner";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VotingPage({params}: {params: {groupId: string}}){

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTokenChecked, setIsTokenChecked] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [submissionList, setSubmissionList] = useState<Song[]>([]);
  const [points, setPoints] = useState<{ [key: string]: number }>({});
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");

  const router = useRouter();
  
useEffect(() => {
  const token = localStorage.getItem("jwt");

  if (token) {
    fetch("/api/session", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);

          const userId = data.userId;
          console.log("User ID:", userId);
          setUserId(userId);
        } else {
          setIsAuthenticated(false);
          router.push("/login")
          localStorage.removeItem("jwt");
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        router.push("/login")
        localStorage.removeItem("jwt");
      })
      .finally(() => {
        setIsTokenChecked(true);
      });
  } else {
    setIsTokenChecked(true);
  }
}, [router]);



  const fetchSpotifyToken = async () => {
    const clientId = "2e3389690b7b4d539eb8c8749e3c17cb";
    const clientSecret = "4dee54a8e0244f9eb0d4a1da83edfe5d";

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  };

  const searchSongs = async (query: string) => {
    if (!query) {
      setSearchResults([]); // Clear search results if the search term is empty
      return;
    }

    const token = await fetchSpotifyToken();
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      params: { q: query, type: "track", limit: 10 },
      headers: { Authorization: `Bearer ${token}` },
    });

    const results = response.data.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      year: new Date(track.album.release_date).getFullYear(),
    }));

    setSearchResults(results);
  };

  const handleAddSong = (song: Song) => {
    if (submissionList.length >= 10) {
      alert("You can only add up to 10 songs!");
      return;
    }
    if (submissionList.find((s) => s.id === song.id)) {
      alert("This song is already in your submission list!");
      return;
    }
    setSubmissionList([...submissionList, song]);
    setSearchResults([]); 
    setSearchTerm("");
  };

  const handlePointChange = (songId: number, value: number) => {
    const newPoints = { ...points, [songId]: value };
    setPoints(newPoints);

    const values = Object.values(newPoints);
    if (new Set(values).size !== values.length) {
      setError("Points must be unique!");
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    // Check if the submission list has exactly 10 songs
    if (submissionList.length < 10) {
      alert("You must add exactly 10 songs!");
      return;
    }
  
    // Check for errors (e.g., points not unique)
    if (error) {
      alert("Resolve errors before submitting!");
      return;
    }
  
    // Calculate the total points to ensure they sum to 55
    const totalPoints = Object.values(points).reduce((sum, point) => sum + point, 0);
    if (totalPoints !== 55) {
      alert("The total points must be exactly 55!");
      return;
    }
  
    // Prepare the final submission data
    const finalSubmission = submissionList.map((song) => ({
      ...song,
      points: points[song.id] || 0,
    }));
  
    const token = localStorage.getItem('jwt');

    if (!token) {
      alert("You must be logged in to submit the song list.");
      return;
    }
  
    // Send data to the backend API via POST request with Authorization header
    try {
      const response = await fetch('/api/submitSongList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          list: finalSubmission,
          groupId: params.groupId,
          userId: userId,
        }),
      });
  
      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      } else {
        const responseData = await response.json();
        alert(responseData.message); // Success message from the API
      }
    } catch (error) {
      console.error('Error during submission:', error);
      alert('An error occurred while submitting. Please try again later.');
    }
  };
  
  

  if (loading){
    return(
      <FloatingLoaderSpinner text="Loading songs..." />
    )
  }
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8 overflow-y-auto max-h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Vote for Songs</h1>

      {/* Search Section */}
      <div className="mb-8 text-black">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchSongs(e.target.value);  // Trigger search when the input changes
          }}
          placeholder="Search for a song..."
          className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <ul className="mt-4 space-y-3">
          {searchResults.map((song) => (
            <li
              key={song.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              <span className="text-lg text-gray-700">{song.title} by {song.artist} ({song.year})</span>
              <button
                onClick={() => handleAddSong(song)}
                className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Submission Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submission List</h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Artist</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Year</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Points</th>
            </tr>
          </thead>
          <tbody>
            {submissionList.map((song) => (
              <tr key={song.id} className="border-t">
                <td className="px-4 py-2 text-gray-700">{song.title}</td>
                <td className="px-4 py-2 text-gray-700">{song.artist}</td>
                <td className="px-4 py-2 text-gray-700">{song.year}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={points[song.id] || ""}
                    onChange={(e) => handlePointChange(song.id, Number(e.target.value))}
                    className="w-20 p-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <Button
        onClick={handleSubmit}
        className="w-full py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300"
      >
        Submit Votes
      </Button>
    </div>
  );
};
