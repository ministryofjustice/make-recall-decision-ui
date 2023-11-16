import { NextFunction, Request, Response } from 'express'
import { searchForPpcs } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.query
  const { user } = res.locals

  const { results } = await searchForPpcs(user.token, crn as string)
  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsSearchResults',
    },
    crn,
    result: results.length > 0 ? results[0] : undefined,
  }

  res.render(`pages/ppcsSearchResults`)
  next()
}

export default { get }
