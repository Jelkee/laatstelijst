"use client";

import { Group, Submission, Vote } from "@/app/types"; // Adjust according to your types
import { FloatingLoaderSpinner } from "@/components/FloatingLoaderSpinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Importing Table components from ChadCN UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { groupId: string } }) {
  
  let groupId = params.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
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
        console.log("submissiondata: ", submissionsData)
        console.log("votesdata", votesData)

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-900">{group?.name}</h1>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-700">Your Submissions</h2>
            {submissions.length === 0 ? (
              <p className="mt-2 text-gray-600">No submissions yet.</p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Song Title</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.song?.title ?? "No Title"}</TableCell>
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
            <h2 className="text-xl font-semibold text-gray-700">Your Votes</h2>
            {votes.length === 0 ? (
              <p className="mt-2 text-gray-600">You have not voted yet.</p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Song Title</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>{vote.song?.title ?? ""}</TableCell>
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
      </Tabs>
    </div>
  );
}
