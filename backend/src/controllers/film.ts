import { Request, Response } from 'express'
import { filmService } from '../services/film'

export const filmController = {
  async list(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined
      const limit = req.query.limit ? Number(req.query.limit) : undefined
      const category = req.query.category as string | undefined
      const year = req.query.year ? Number(req.query.year) : undefined
      const rating = req.query.rating ? Number(req.query.rating) : undefined
      const search = req.query.search as string | undefined
      const sort = req.query.sort as string | undefined
      const { list, total } = await filmService.list({
        page,
        limit,
        category,
        year,
        minRating: rating,
        search,
        sort
      })
      res.json({ films: list, total })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const film = await filmService.getById(id)
      if (!film) return res.status(404).json({ error: 'Film non trouvé' })
      res.json(film)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }
}
