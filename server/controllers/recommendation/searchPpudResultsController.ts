import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { ppudDetails, updateRecommendation } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'searchPpudResults',
    },
    results: req.session.ppudSearchResults || [],
  }
  res.render(`pages/recommendations/searchPpudResults`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { id } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const details = await ppudDetails(token, id)

  await updateRecommendation({
    recommendationId: String(recommendationId),
    valuesToSave: {
      ppudOffender: details.offender,
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
