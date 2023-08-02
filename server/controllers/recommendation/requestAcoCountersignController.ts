import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    user: { token },
  } = res.locals

  const statuses = await getStatuses({
    recommendationId,
    token,
  })

  const isAcoSignatureRequested = statuses
    .filter(status => status.active)
    .find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)

  if (!isAcoSignatureRequested) {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.ACO_SIGNATURE_REQUESTED],
      deActivate: [],
    })
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'requestAcoCountersign',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/task-list`,
  }

  res.render(`pages/recommendations/requestAcoCountersign`)
  next()
}

export default { get }
