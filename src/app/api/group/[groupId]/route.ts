import { DatabaseManager } from "@/db";
import { verifyToken } from "@/lib/auth";
import { group } from "@/schema";
import { eq } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: {params: {groupId: string}}) {
    try{
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

        const db = DatabaseManager.getDatabase();

        const result = await db.select({id: group.id, name: group.name}).from(group).where(eq(group.id, groupId))

        if (result) {
            return NextResponse.json(result);
          } else {
            return NextResponse.json({error: "Group not found"}, {status: 404});
          }

    } catch (error) {
        console.error("Error fetching group:", error);
        

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    
    
  

  
}
