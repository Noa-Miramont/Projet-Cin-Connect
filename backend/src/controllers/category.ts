import { Request, Response } from 'express'
import { categoryRepository } from '../repositories/category'

export const categoryController = {
  async list(_req: Request, res: Response) {
    try {
      const categories = await categoryRepository.findAll()
      res.json(categories)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }
}
