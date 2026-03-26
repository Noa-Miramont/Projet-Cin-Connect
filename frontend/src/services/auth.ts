import { api, getApiErrorMessage } from './api'

export async function forgotPassword(email: string) {
  try {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', {
      email
    })
    return data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Impossible de traiter la demande de réinitialisation.'
      )
    )
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password
    })
    return data
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Impossible de mettre à jour le mot de passe')
    )
  }
}
