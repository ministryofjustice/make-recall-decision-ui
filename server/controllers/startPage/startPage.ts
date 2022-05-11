import { Request, Response } from 'express'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/startPage')
}
