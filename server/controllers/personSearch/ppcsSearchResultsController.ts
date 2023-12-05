import { NextFunction, Request, Response } from 'express'
import { searchForPpcs } from '../../data/makeDecisionApiClient'
import { isDefined, isEmptyStringOrWhitespace } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.query
  const { user } = res.locals

  if (!isDefined(crn) || isEmptyStringOrWhitespace(crn as string)) {
    res.redirect(303, `no-ppcs-search-results?crn=${crn}`)
    return
  }

  const { results } = await searchForPpcs(user.token, crn as string)

  if (results.length === 0) {
    res.redirect(303, `no-ppcs-search-results?crn=${crn}`)
    return
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsSearchResults',
    },
    crn,
    result: results[0],
  }

  res.render(`pages/ppcsSearchResults`)
  next()
}

export default { get }
