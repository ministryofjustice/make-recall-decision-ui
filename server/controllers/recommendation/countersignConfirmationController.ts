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

  const statuses = (
    await getStatuses({
      recommendationId,
      token,
    })
  ).filter(status => status.active)

  const isSpoSigned = !!statuses.find(status => status.name === STATUSES.SPO_SIGNED)
  const isAcoSigned = !!statuses.find(status => status.name === STATUSES.ACO_SIGNED)
  const isAcoSignatureRequested = !!statuses.find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)

  if (isSpoSigned && !isAcoSigned && !isAcoSignatureRequested) {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.ACO_SIGNATURE_REQUESTED],
      deActivate: [],
    })
  }

  res.locals = {
    isAcoSigned,
    ...res.locals,
    page: {
      id: 'countersignConfirmation',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/task-list`,
  }

  res.render(`pages/recommendations/countersignConfirmation`)
  next()
}

export default { get }
