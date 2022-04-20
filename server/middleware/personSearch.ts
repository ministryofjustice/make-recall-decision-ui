import { Request, Response } from 'express'

export const personSearch = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/personSearch')
}
