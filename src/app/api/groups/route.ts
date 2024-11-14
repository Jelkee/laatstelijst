import { verifyToken } from "@/lib/auth"; // The function to verify JWT
import { getUserGroups } from "@/lib/profileBackend"; // The function to fetch groups from the database
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Split the header to get the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify the token and decode it
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Fetch groups associated with the user from the database
    const userGroups = await getUserGroups(user.id);
    
    if (!userGroups) {
      return NextResponse.json({ error: "No groups found" }, { status: 404 });
    }

    return NextResponse.json(userGroups); // Return the user groups as JSON

  } catch (error) {
    console.error("Error fetching groups:", error);
    
    // Detailed error message for debugging or logging purposes
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
