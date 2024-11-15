// src/app/api/submitSongList/route.ts
import { DatabaseManager } from "@/db";
import { song, submission } from "@/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from 'next/server';

export interface SubmittedSong {
  title: string;
  artist: string;
  year: number;
  points: number;
}

// Helper function to submit song list
async function submitSongList(list: SubmittedSong[], groupId: string, userId: string) {
  const db = DatabaseManager.getDatabase();

  try {
    for (const submittedSong of list) {
      const inSongList = await db.query.song.findFirst({
        where: and(
          eq(song.title, submittedSong.title),
          eq(song.artist, submittedSong.artist),
          eq(song.year, submittedSong.year)
        )
      });

      if (!inSongList) {
        const newSongId = await db.insert(song).values({
          title: submittedSong.title,
          artist: submittedSong.artist,
          year: submittedSong.year
        }).returning();

        await db.insert(submission).values({
          songId: newSongId[0].id,
          groupId: groupId,
          points: submittedSong.points,
          userId: userId
        });
      } else {
        await db.insert(submission).values({
          songId: inSongList.id,
          groupId: groupId,
          userId: userId,
          points: submittedSong.points
        });
      }
    }
    console.log("Songs successfully submitted!");
  } catch (error) {
    console.error("Error submitting songs: ", error);
    throw error;
  }
}

// Define the API route handler
export async function POST(req: NextRequest) {
  try {
    // Get data from the request body
    const { list, groupId, userId } = await req.json();

    // Validate incoming data
    if (!Array.isArray(list) || !groupId || !userId) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Call the helper function to submit the song list
    await submitSongList(list, groupId, userId);

    // Return success response
    return NextResponse.json({ message: "Songs successfully submitted!" });
  } catch (error) {
    console.error("Error in API: ", error);
    return NextResponse.json({ error: "Error submitting songs"}, { status: 500 });
  }
}
