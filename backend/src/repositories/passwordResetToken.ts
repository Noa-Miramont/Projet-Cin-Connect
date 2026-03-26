import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../db'
import { passwordResetTokens } from '../db/schema'

export const passwordResetTokenRepository = {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    const [row] = await db
      .insert(passwordResetTokens)
      .values({
        user_id: data.userId,
        token_hash: data.tokenHash,
        expires_at: data.expiresAt
      })
      .returning()
    return row
  },

  async findActiveByTokenHash(tokenHash: string) {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token_hash, tokenHash),
          isNull(passwordResetTokens.used_at),
          gt(passwordResetTokens.expires_at, new Date())
        )
      )

    return row
  },

  async invalidateActiveForUser(userId: string) {
    await db
      .update(passwordResetTokens)
      .set({ used_at: new Date() })
      .where(
        and(
          eq(passwordResetTokens.user_id, userId),
          isNull(passwordResetTokens.used_at),
          gt(passwordResetTokens.expires_at, new Date())
        )
      )
  },

  async markUsed(id: string) {
    await db
      .update(passwordResetTokens)
      .set({ used_at: new Date() })
      .where(eq(passwordResetTokens.id, id))
  }
}
