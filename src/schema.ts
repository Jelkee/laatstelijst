import { boolean, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import crypto from "node:crypto";

// Users Table
export const user = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  isAdmin: boolean('is_admin').default(false), // Admin status
  email: varchar('email', { length: 255 }).unique(), // Optional: Email for login
  createdAt: timestamp('created_at').defaultNow(), // Time user was created
});

// Groups Table
export const group = pgTable('group', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(), // Time group was created
});

// User-Groups Table (Many-to-Many relation)
export const userGroup = pgTable('user_group', {
  userId: integer('user_id').notNull().references(() => user.id),
  groupId: integer('group_id').notNull().references(() => group.id),
  role: varchar('role', { length: 50 }).default('member'), // User's role in the group, e.g., member, admin
});

// Song Submissions Table
export const submission = pgTable('submission', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  year: integer('year').notNull(),
  points: integer('points').default(0), // Total points for the song, initially 0
  createdAt: timestamp('created_at').defaultNow(), // Time of submission
});

// Votes Table (Users vote on other users' submissions)
export const vote = pgTable('vote', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id), // Who is voting
  submissionId: integer('submission_id').notNull().references(() => submission.id), // Which submission is voted on
  points: integer('points').notNull(), // Points given to the submission
  createdAt: timestamp('created_at').defaultNow(), // When vote was cast
});

// List Table (Final list of songs for each group, ordered by total points)
export const list = pgTable('list', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => group.id), // Group the list belongs to
  submissionId: integer('submission_id').notNull().references(() => submission.id), // Submitted song included in the list
  points: integer('points').notNull(), // Total points of the song
});
