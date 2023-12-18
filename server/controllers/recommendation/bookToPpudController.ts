import { NextFunction, Request, Response } from 'express'
import { bookRecallToPpud, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    user: { token },
    urlInfo,
  } = res.locals

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

export default { get }
