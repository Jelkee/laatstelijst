"use client";

import { Group, Submission, Vote, YourVote } from "@/app/types"; // Adjust according to your types
import { FloatingLoaderSpinner } from "@/components/FloatingLoaderSpinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Importing Table components from ChadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { groupId: string } }) {
  
  let groupId = params.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [votes, setVotes] = useState<YourVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setError("Invalid Group ID");
      setLoading(false);
      return;
    }

    const fetchGroupData = async () => {
      try {
        setLoading(true);

        const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

        if (!token) {
          setError("You must be logged in to view a group");
          setLoading(false);
          return;
        }

        // Fetch group, submissions, and votes in parallel
        const [groupRes, submissionRes, votesRes] = await Promise.all([
          fetch(`/api/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/group/${groupId}/submissions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/group/${groupId}/votes`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!groupRes.ok || !submissionRes.ok || !votesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const groupData = await groupRes.json();
        const submissionsData = await submissionRes.json();
        const votesData = await votesRes.json();

        console.log("groupData:", groupData);
        console.log("submissiondata: ", submissionsData);
        console.log("votesdata", votesData);

        setGroup(groupData);
        setSubmissions(submissionsData);
        setVotes(votesData);

      } catch (error) {
        if (error instanceof Error) {
          setError(`Failed to fetch group data: ${error.message}`);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]); // Trigger effect when `groupId` changes

  if (loading) {
    return <FloatingLoaderSpinner text="Loading group information..."/>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const calculateTotalPoints = (items: { points: number }[]) => {
    return items.reduce((total, item) => total + item.points, 0);
  };


  const createList = (submissions: Submission[], votes: Vote[]) => {
    // Create a map to store submission points updated by votes
    const submissionPointsMap = new Map<number, number>();

    // Initialize the map with submission points
    submissions.forEach((submission) => {
      submissionPointsMap.set(submission.id, submission.points);
    });

    // Add vote points to the corresponding submission
    votes.forEach((vote) => {
      if (submissionPointsMap.has(vote.submissionId)) {
        const currentPoints = submissionPointsMap.get(vote.submissionId) ?? 0;
        submissionPointsMap.set(vote.submissionId, currentPoints + vote.points);
      }
    });

    // Create the final list of submissions with updated points
    const updatedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      type: "Submission",
      songTitle: submission.song.title ?? "No Title",
      artist: submission.song.artist ?? "No artist",
      year: submission.song.year ?? "N/A",
      points: submissionPointsMap.get(submission.id) ?? submission.points,
    }));

    return updatedSubmissions;
  };

  // Generate the combined list
  const list = createList(submissions, votes);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">{group?.name}</h1>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Submissions</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Your Submissions</h2>
            {submissions.length === 0 ? (
              <p className="mt-2">No submissions yet.</p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Song Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.song.title ?? "No title"}</TableCell>
                      <TableCell>{submission.song.artist ?? "No artist"}</TableCell>
                      <TableCell>{submission.song.year ?? "N/A"}</TableCell>
                      <TableCell className="text-green-600">{submission.points} points</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <strong>Total Points: </strong>
              <span>{calculateTotalPoints(submissions)} points</span>
            </div>
          </div>
        </TabsContent>

        {/* Votes Tab */}
        <TabsContent value="votes">
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Your Votes</h2>
            {votes.length === 0 ? (
              <p className="mt-2">You have not voted yet.</p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Song title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>{vote.submissionId}</TableCell>
                      <TableCell>{vote.submissionTitle}</TableCell>
                      <TableCell>{vote.submissionArtist}</TableCell>
                      <TableCell>{vote.submissionYear}</TableCell>
                      <TableCell className="text-blue-600">{vote.points} points</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <strong>Total Points from Votes: </strong>
              <span>{calculateTotalPoints(votes)} points</span>
            </div>
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list">
          <div className="mt-4">
            <h2 className="text-xl font-semibold">List</h2>
            {list.length === 0 ? (
              <p className="mt-2">No data available.</p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Song Title</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.songTitle}</TableCell>
                      <TableCell>{item.points} points</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
