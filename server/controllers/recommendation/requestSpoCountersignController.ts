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

  const isSpoSignatureRequested = statuses
    .filter(status => status.active)
    .find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)

  const isSpoSigned = statuses.filter(status => status.active).find(status => status.name === STATUSES.SPO_SIGNED)

  if (!isSpoSignatureRequested && !isSpoSigned) {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.SPO_SIGNATURE_REQUESTED],
      deActivate: [],
    })
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'requestSpoCountersign',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/task-list`,
  }

  res.render(`pages/recommendations/requestSpoCountersign`)
  next()
}

export default { get }
