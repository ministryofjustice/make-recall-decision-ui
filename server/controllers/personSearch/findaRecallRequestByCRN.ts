import { Request, Response } from 'express'

export const findaRecallRequestByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/findaRecallRequestByCRN')
}
