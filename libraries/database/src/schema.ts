import * as p from 'drizzle-orm/pg-core';

export const usersTable = p.pgTable('users', {
  id: p.serial().primaryKey(),
  displayName: p.text().notNull(),
  email: p.text().unique(), // this can be null; if the user only uses OIDC and has no password
  profilePictureUrl: p.text(),
});

export const userAuthTable = p.pgTable('user_auth', {
  id: p.serial().primaryKey(),
  userId: p.integer().references(() => usersTable.id),
  provider: p.text().notNull(),
  authToken: p.text().notNull(),
  refreshToken: p.text().notNull(),
  subject: p.text().notNull(),
  expiresAt: p.timestamp().notNull(),
  createdAt: p.timestamp().notNull().defaultNow(),
  updatedAt: p.timestamp().notNull().defaultNow(),
});
