import { Request, Response } from 'express'

export const personSearchByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/personSearchByCRN')
}
