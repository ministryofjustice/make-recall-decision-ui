import { NextFunction, Request, Response } from 'express'
import { getStatuses, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, user } = res.locals

  const statuses = await getStatuses({
    recommendationId: String(recommendation.id),
    token: user.token,
  })

  const isSpoSignatureRequested = statuses
    .filter(status => status.active)
    .find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)

  const mode = isSpoSignatureRequested ? 'SPO' : 'ACO'

  res.locals = {
    ...res.locals,
    page: {
      id: 'countersigningTelephone',
    },
    mode,
    inputDisplayValues: {
      errors: res.locals.errors,
      value: mode === 'SPO' ? recommendation.countersignSpoTelephone : recommendation.countersignAcoTelephone,
    },
  }

  res.render(`pages/recommendations/countersigningTelephone`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { telephone, mode } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: mode === 'SPO' ? { countersignSpoTelephone: telephone } : { countersignAcoTelephone: telephone },
    token,
    featureFlags: flags,
  })

  const nextPageId = mode === 'SPO' ? 'spo-countersignature' : 'aco-countersignature'

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo: { ...urlInfo, fromPageId: undefined } }))
}

export default { get, post }
