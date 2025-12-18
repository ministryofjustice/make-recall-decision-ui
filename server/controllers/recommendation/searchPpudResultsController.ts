import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, ppudDetails, updateRecommendation } from '../../data/makeDecisionApiClient'
import {
  PpudOffender,
  RecommendationResponse,
} from '../../@types/make-recall-decision-api/models/RecommendationResponse'

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
  let { id } = req.body
  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse
  const activeId = recommendation.ppudOffender?.id

  let ppudOffender: PpudOffender | null = null

  // If there's an ID this is a request to update an existing record, so fetch the details from PPUD
  if (id) {
    const { offender } = await ppudDetails(token, id)
    ppudOffender = offender
    id = offender.id // We only have a partial ID, so replace it with the full one for comparison
  }

  await updateRecommendation({
    recommendationId: String(recommendationId),
    valuesToSave: {
      ppudOffender,
      // Clear the booking when we change the active ID
      // Keep it if the ID is the same, or both IDs are null in the case of a new record
      ...(String(activeId) !== String(id) && !(activeId === null && id === null) && { bookRecallToPpud: null }),
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
