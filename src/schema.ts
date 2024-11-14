import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, primaryKey, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import crypto from "node:crypto";

// Users Table
export const user = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),  // UUID type
  givenName: text('given_name').notNull(),
  familyName: text('family_name').notNull(),
  isAdmin: boolean('is_admin').default(false), // Admin status
  email: varchar('email', { length: 255 }).unique(), // Optional: Email for login
  createdAt: timestamp('created_at').defaultNow(), // Time user was created
});

// Groups Table
export const group = pgTable('group', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(), // Time group was created
});

// User-Groups Table (Many-to-Many relation)
export const userGroup = pgTable('user_group', {
  userId: text('user_id').notNull().references(() => user.id),
  groupId: text('group_id').notNull().references(() => group.id),
  role: varchar('role', { length: 50 }).default('member'), // User's role in the group, e.g., member, admin
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.groupId]})
}));

export const userGroupRelations = relations(userGroup, ({ one }) => ({
  user: one(user, {
    fields: [userGroup.userId],
    references: [user.id]
  }),
  supervisor: one(group, {
    fields: [userGroup.groupId],
    references: [group.id]
  })
}))

// Song Submissions Table
export const submission = pgTable('submission', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id), // User submitting the song
  songId: integer('song_id').notNull().references(() => song.id), // Reference to the song table
  groupId: text('group_id').notNull().references(() => group.id),
  points: integer('points').default(0), // Total points for the song, initially 0
  createdAt: timestamp('created_at').defaultNow(), // Time of submission
});


// Votes Table (Users vote on other users' submissions)
export const vote = pgTable('vote', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id), // Who is voting
  submissionId: integer('submission_id').notNull().references(() => submission.id), // Reference to the submission
  points: integer('points').notNull(), // Points given to the submission
  createdAt: timestamp('created_at').defaultNow(), // When vote was cast
});


export const song = pgTable('song', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  year: integer('year').notNull(),
});

// Submission Relations
export const submissionRelations = relations(submission, ({ one, many }) => ({
  song: one(song, {
    fields: [submission.songId],
    references: [song.id],
  }),
  group: one(group, {
    fields: [submission.groupId],
    references: [group.id]
  }),
  votes: many(vote), // A submission can have many votes
}));

// Vote Relations
export const voteRelations = relations(vote, ({ one }) => ({
  submission: one(submission, {
    fields: [vote.submissionId],
    references: [submission.id],
  }),
  user: one(user, {
    fields: [vote.userId],
    references: [user.id],
  }),
}));


export const userRelations = relations(user, ({ many }) => ({
  votes: many(vote), // A user can have many votes
}));
