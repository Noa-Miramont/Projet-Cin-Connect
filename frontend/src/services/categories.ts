import { api } from './api'

export type Category = {
  id: string
  name: string
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}
