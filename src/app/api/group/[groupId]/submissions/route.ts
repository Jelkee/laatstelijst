import { DatabaseManager } from "@/db";
import { verifyToken } from "@/lib/auth";
import { song, submission } from "@/schema"; // Assuming this is the schema for submissions
import { eq } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    // Step 1: Authorization check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const { groupId } = await params;

    // Step 3: Fetch submissions from the database
    const db = DatabaseManager.getDatabase();
    const result = await db
      .select({ id: submission.id, points: submission.points, song: song })
      .from(submission).innerJoin(song, eq(submission.songId, song.id))
      .where(eq(submission.groupId, groupId)); // Use the converted number value here

    // Step 4: Return the appropriate response
    if (result.length > 0) {
      return NextResponse.json(result); // Return submissions if found
    } else {
      return NextResponse.json({ error: "No submissions found for this group" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
