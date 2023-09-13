import { Request, Response } from 'express'

export const personSearchByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  const { flags } = res.locals
  if (flags.flagSearchByName) {
    res.render('pages/personSearchByCRN')
  } else {
    res.render('pages/personSearch')
  }
}
