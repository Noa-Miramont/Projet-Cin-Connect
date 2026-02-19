import { userRepository } from '../repositories/user'
import { reviewRepository } from '../repositories/review'

export const userService = {
  async getMe(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at
    }
  },

  async getMyReviews(userId: string) {
    return reviewRepository.findByUserId(userId)
  },

  async searchByUsername(query: string, limit = 10) {
    return userRepository.searchByUsername(query, limit)
  }
}
