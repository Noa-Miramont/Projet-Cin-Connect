jest.mock('../repositories/review', () => ({
  reviewRepository: {
    findUserReviewForFilm: jest.fn(),
    deleteByUserAndFilm: jest.fn()
  }
}))

import { reviewService } from '../services/review'
import { reviewRepository } from '../repositories/review'

const mockedReviewRepository = reviewRepository as jest.Mocked<typeof reviewRepository>

describe('reviewService.delete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete the authenticated user review for a film', async () => {
    mockedReviewRepository.findUserReviewForFilm.mockResolvedValueOnce({
      id: 'review-1',
      user_id: 'user-1',
      film_id: 'film-1'
    } as never)
    mockedReviewRepository.deleteByUserAndFilm.mockResolvedValueOnce({
      id: 'review-1'
    } as never)

    await expect(reviewService.delete('user-1', 'film-1')).resolves.toEqual({
      id: 'review-1'
    })

    expect(mockedReviewRepository.findUserReviewForFilm).toHaveBeenCalledWith(
      'user-1',
      'film-1'
    )
    expect(mockedReviewRepository.deleteByUserAndFilm).toHaveBeenCalledWith(
      'user-1',
      'film-1'
    )
  })

  it('should reject when the review does not exist', async () => {
    mockedReviewRepository.findUserReviewForFilm.mockResolvedValueOnce(undefined as never)

    await expect(reviewService.delete('user-1', 'film-1')).rejects.toThrow(
      'Avis introuvable'
    )

    expect(mockedReviewRepository.deleteByUserAndFilm).not.toHaveBeenCalled()
  })
})
