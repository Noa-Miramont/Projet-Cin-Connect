export type PasswordRequirement = {
  id: string
  label: string
  test: (password: string) => boolean
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Minimum 8 caracteres',
    test: (password) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'Au moins une majuscule',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'Au moins une minuscule',
    test: (password) => /[a-z]/.test(password)
  },
  {
    id: 'digit',
    label: 'Au moins un chiffre',
    test: (password) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'Au moins un caractere special',
    test: (password) => /[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?`~]/.test(password)
  }
]

export function getPasswordRequirementStatus(password: string) {
  return passwordRequirements.map((requirement) => ({
    ...requirement,
    met: requirement.test(password)
  }))
}

export function isStrongPassword(password: string) {
  return getPasswordRequirementStatus(password).every((requirement) => requirement.met)
}
