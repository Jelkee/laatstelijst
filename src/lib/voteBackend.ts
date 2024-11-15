import { DatabaseManager } from "@/db";
import { song, submission } from "@/schema";
import { and, eq } from "drizzle-orm";

export interface SubmittedSong {
  title: string;
  artist: string;
  year: number;
  points: number;
}
  

export async function submitSongList(list: SubmittedSong[], groupId: string, userId: string) {

  const db = DatabaseManager.getDatabase();

  try {

    for (const submittedSong of list) {

      const inSongList = await db.query.song.findFirst({where: (and(eq(song.title, submittedSong.title), eq(song.artist, submittedSong.artist), eq(song.year, submittedSong.year)))});

      if (!inSongList){
          const newSongId = await db.insert(song).values({
              title: submittedSong.title,
              artist: submittedSong.artist,
              year: submittedSong.year
          }).returning()

          await db.insert(submission).values({
              songId: newSongId[0].id,
              groupId: groupId,
              points: submittedSong.points,
              userId: userId
          })
      }
      
      else {
        await db.insert(submission).values({
          songId: inSongList.id,
          groupId: groupId,
          userId: userId,
          points: submittedSong.points
        })
      }

      
    }
    console.log("Songs successfully submitted!");
  } catch (error) {
    // If there's an error, roll back the transaction
    console.error("Error submitting songs: ", error);
    throw error; // Optionally, rethrow the error to handle it at a higher level
  }
}