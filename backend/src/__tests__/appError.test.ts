import { AppError, isAppError } from '../errors/appError'

describe('AppError', () => {
  it('stores status and message', () => {
    const error = new AppError(404, 'Not found')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.status).toBe(404)
    expect(error.message).toBe('Not found')
  })

  it('isAppError identifies AppError instances', () => {
    expect(isAppError(new AppError(400, 'Bad request'))).toBe(true)
    expect(isAppError(new Error('Generic error'))).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})
