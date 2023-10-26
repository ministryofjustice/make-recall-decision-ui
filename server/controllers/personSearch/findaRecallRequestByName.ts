import { Request, Response } from 'express'

export const findaRecallRequestByName = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/findaRecallRequestByName')
}
