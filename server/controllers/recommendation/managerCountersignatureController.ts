import { NextFunction, Request, Response } from 'express'
import { getStatuses, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { isMandatoryTextValue } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

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
  const pageId = isSpoSignatureRequested ? 'lineManagerCountersignature' : 'seniorManagerCountersignature'

  res.locals = {
    ...res.locals,
    page: {
      id: pageId,
    },
    mode,
    inputDisplayValues: {
      errors: res.locals.errors,
      managerCountersignatureExposition:
        mode === 'SPO' ? recommendation.countersignSpoExposition : recommendation.countersignAcoExposition,
    },
  }

  res.render(`pages/recommendations/managerCountersignature`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { managerCountersignatureExposition, mode } = req.body

  if (mode !== 'SPO' && mode !== 'ACO') {
    throw new Error('Invalid mode')
  }

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(managerCountersignatureExposition)) {
    const errorId = 'missingManagerCountersignatureExposition'
    errors.push(
      makeErrorObject({
        id: 'managerCountersignatureExposition',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave:
      mode === 'SPO'
        ? { countersignSpoExposition: managerCountersignatureExposition }
        : { countersignAcoExposition: managerCountersignatureExposition },
    token,
    featureFlags: flags,
  })

  if (mode === 'SPO') {
    await updateStatuses({
      recommendationId,
      token,
      deActivate: [STATUSES.SPO_SIGNATURE_REQUESTED],
      activate: [STATUSES.SPO_SIGNED],
    })
  } else {
    await updateStatuses({
      recommendationId,
      token,
      deActivate: [STATUSES.ACO_SIGNATURE_REQUESTED],
      activate: [STATUSES.ACO_SIGNED, STATUSES.COMPLETED],
    })
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'countersign-confirmation', urlInfo }))
}

export default { get, post }
