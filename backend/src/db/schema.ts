import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  primaryKey
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique()
})

export const films = pgTable('films', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  year: integer('year'),
  director: varchar('director', { length: 255 }),
  poster_url: varchar('poster_url', { length: 1000 }),
  category_id: uuid('category_id').references(() => categories.id)
})

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  film_id: uuid('film_id')
    .notNull()
    .references(() => films.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const friends = pgTable('friends', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friend_id: uuid('friend_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sender_id: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  receiver_id: uuid('receiver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
})

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  sentMessages: many(messages),
  receivedMessages: many(messages)
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  films: many(films)
}))

export const filmsRelations = relations(films, ({ one, many }) => ({
  category: one(categories),
  reviews: many(reviews)
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users),
  film: one(films)
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.sender_id], references: [users.id] }),
  receiver: one(users, {
    fields: [messages.receiver_id],
    references: [users.id]
  })
}))
