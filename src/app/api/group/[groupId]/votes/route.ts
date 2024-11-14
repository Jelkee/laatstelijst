import { DatabaseManager } from "@/db";
import { verifyToken } from "@/lib/auth";
import { submission, vote } from "@/schema"; // Assuming this is the schema for votes
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

    // Step 2: Await params and validate groupId
    const { groupId } = await params;  // params should be awaited in Next.js API routes
      

    // Step 3: Fetch votes from the database
    const db = DatabaseManager.getDatabase();
    const result = await db
      .select({ id: vote.id, submissionId: vote.submissionId, points: vote.points })
      .from(vote)
      .innerJoin(submission, eq(submission.id, vote.submissionId))
      .where(eq(submission.groupId, groupId)); // groupId used directly here

    // Step 4: Return the appropriate response
    if (result.length > 0) {
      return NextResponse.json(result); // Return votes if found
    } else {
      return NextResponse.json({ error: "No votes found for this group" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
