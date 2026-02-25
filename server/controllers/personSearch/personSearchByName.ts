import { Request, Response } from 'express'

const personSearchByName = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/personSearchByName')
}

export default personSearchByName
