import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppcsSearch } from '../../data/makeDecisionApiClient'
import { isDefined, isEmptyStringOrWhitespace } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.query
  const {
    user: { token },
  } = res.locals

  if (!isDefined(crn) || isEmptyStringOrWhitespace(crn as string)) {
    res.redirect(303, `no-ppcs-search-results?crn=`)
    return
  }

  const { results } = await ppcsSearch(token, crn as string)

  if (results.length === 0) {
    res.redirect(303, `no-ppcs-search-results?crn=${crn}`)
    return
  }

  const recommendation = await getRecommendation(String(results[0].recommendationId), token)

  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsSearchResults',
    },
    crn,
    bookingOnStarted: !!recommendation.bookingMemento,
    result: results[0],
  }

  res.render(`pages/ppcsSearchResults`)
  next()
}

export default { get }
