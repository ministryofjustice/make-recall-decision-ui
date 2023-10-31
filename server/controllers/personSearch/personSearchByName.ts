import { Request, Response } from 'express'

export const personSearchByName = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/personSearchByName')
}
