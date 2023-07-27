import { Request, Response } from 'express'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  const { flags } = res.locals
  if (flags.flagSearchByName) {
    res.locals.searchEndpoint = '/search-by-name'
  } else {
    res.locals.searchEndpoint = '/search-by-crn'
  }
  res.render('pages/startPage')
}
