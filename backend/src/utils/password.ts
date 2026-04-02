const PASSWORD_POLICY_MESSAGE =
  'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'

const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z]) (?=.*[A-Z]) (?=.*\d) (?=.*[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?`~])    .{8,}$/

export function isStrongPassword(password: string) {
  return PASSWORD_POLICY_REGEX.test(password)
}

export function getPasswordPolicyMessage() {
  return PASSWORD_POLICY_MESSAGE
}
