import { DatabaseManager } from '@/db'; // Assuming you have a database manager utility
import { user, userGroup } from '@/schema'; // Assuming you have these schemas defined
import { and, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Function to retrieve user data and their groups
export async function getUserProfile(token: string) {
  try {
    // Verify the JWT token and extract user email
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    
    // Fetch user information from the database using id
    const db = DatabaseManager.getDatabase();
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, payload.id),
    });

    if (!userRecord) {
      throw new Error('User not found');
    }

    // Fetch groups the user is part of
    const userGroups = await db.query.userGroup.findMany({
      where: eq(userGroup.userId, userRecord.id),
      with: {
        group: true,  // Join with the group table to get group details
      },
    });

    const groups = userGroups.map((userGroup) => userGroup.group);

    return { user: userRecord, groups };  // Return user data and their groups
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch profile data');
  }
}

export async function joinGroup(groupId: string, token: string) {
  try {
    // Verify the JWT token and extract user ID and email
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    const db = DatabaseManager.getDatabase();

    // Check if the user is already part of the group
    const isInGroup = await db.query.userGroup.findFirst({
      where: and(
        eq(userGroup.userId, payload.id), 
        eq(userGroup.groupId, groupId)
      )
    });

    // If user is not in the group, insert the relationship
    if (!isInGroup) {
      await db.insert(userGroup).values({
        userId: payload.id,
        groupId: groupId,
      });
    } else {
      console.log('User is already in the group');
    }

  } catch (error) {
    console.error('Error joining group:', error);
    throw new Error('Failed to join group');
  }
}
