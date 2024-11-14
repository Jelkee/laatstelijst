import { DatabaseManager } from "@/db";
import { userGroup } from "@/schema";
import { and, eq } from "drizzle-orm";

export async function isInGroup(userId: string, groupId: string){
    const db = DatabaseManager.getDatabase();
    const res = await db.query.userGroup.findFirst({
    where: and(eq(userGroup.userId, userId), eq(userGroup.groupId, groupId)),
    });

    return (!!res)
}
