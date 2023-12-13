import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { bookRecallToPpud, getRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const offence = (recommendation as RecommendationResponse).nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'indexOffenceSelected',
    },
    offence,
  }

  res.render(`pages/recommendations/indexOffenceSelected`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals

  const recommendation = await getRecommendation(recommendationId, token)

  await bookRecallToPpud(token, recommendation.personOnProbation.nomsNumber, recommendation.bookRecallToPpud)

  await updateStatuses({
    recommendationId,
    token,
    activate: [STATUSES.BOOKED_TO_PPUD, STATUSES.REC_CLOSED],
    deActivate: [],
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'booked-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
