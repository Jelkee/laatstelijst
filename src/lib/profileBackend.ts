// /lib/profileBackend.ts
import { DatabaseManager } from '@/db';
import { user, userGroup } from '@/schema';
import { eq } from 'drizzle-orm';
import { isInGroup } from './permissions';

// Fetches only the user profile
export async function getUserProfile(userId: string) {
  try {

    const db = DatabaseManager.getDatabase();
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userRecord) {
      throw new Error('User not found');
    }

    // Return the user record without groups
    return userRecord;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}


// Fetches the groups the user is a part of
export async function getUserGroups(userId: string) {

  try {
    // Verify the JWT token and decode it

    const db = DatabaseManager.getDatabase();
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId)
    });

    if (!userRecord) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Fetch the groups associated with the user
    const userGroups = await db.select({id: userGroup.groupId}).from(userGroup).where(eq(userGroup.userId, userRecord.id))

    if(userGroups.length === 0) {
      return [];
    }

    return userGroups.map((userGroup) => userGroup);

  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw new Error(`Failed to fetch user groups`);
  }
}


// Function for a user to join a group
export async function joinGroup(userId: string, groupId: string) {
  try {

    const db = DatabaseManager.getDatabase();

    const inGroup = await isInGroup(userId, groupId);
    if (!inGroup) {
      await db.insert(userGroup).values({
        userId: userId,
        groupId: groupId,
      });
    }

    return({success: true});

  } catch (error) {
    console.error('Error joining group:', error);
    return {success: false, error: error};
  }
}
