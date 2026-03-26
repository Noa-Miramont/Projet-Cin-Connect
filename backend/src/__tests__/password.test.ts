import { getPasswordPolicyMessage, isStrongPassword } from '../utils/password'

describe('password policy', () => {
  it('accepts a strong password', () => {
    expect(isStrongPassword('Password123!')).toBe(true)
  })

  it('rejects a password without uppercase', () => {
    expect(isStrongPassword('password123!')).toBe(false)
  })

  it('rejects a password without lowercase', () => {
    expect(isStrongPassword('PASSWORD123!')).toBe(false)
  })

  it('rejects a password without digit', () => {
    expect(isStrongPassword('Password!!!')).toBe(false)
  })

  it('rejects a password without special character', () => {
    expect(isStrongPassword('Password123')).toBe(false)
  })

  it('returns the shared policy message', () => {
    expect(getPasswordPolicyMessage()).toBe(
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    )
  })
})
