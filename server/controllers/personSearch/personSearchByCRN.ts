import { Request, Response } from 'express'

const personSearchByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/personSearchByCRN')
}

export default personSearchByCRN
