import { verifyToken } from "@/lib/auth"; // Utility function to verify JWT token
import { joinGroup } from "@/lib/profileBackend"; // Utility function to add user to group
import { NextRequest, NextResponse } from "next/server";

// POST method handler
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
    }

    const user = await verifyToken(token);

    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const result = await joinGroup(user?.id ?? "", groupId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to join the group" }, { status: 400 });
    }

    return NextResponse.json({ message: "Successfully joined the group" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
