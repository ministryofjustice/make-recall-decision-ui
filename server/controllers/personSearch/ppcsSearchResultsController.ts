import { NextFunction, Request, Response } from 'express'
import { searchForPpcs } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.query
  const { user } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsSearchResults',
    },
    crn,
    results: (await searchForPpcs(user.token, crn as string)).results,
  }

  res.render(`pages/ppcsSearchResults`)
  next()
}

export default { get }
