import { NextFunction, Request, Response } from 'express'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isEmptyStringOrWhitespace, normalizeCrn } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { formOptions, isValueValid } from '../recommendations/formOptions/formOptions'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { EVENTS } from '../../utils/constants'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'recallTypeExtended',
    },
    inputDisplayValues: {
      value: res.locals.errors?.recallType ? '' : recommendation.recallType?.selected.value,
    },
  }

  res.render(`pages/recommendations/recallTypeExtended`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { recallType } = req.body

  const {
    flags,
    user: { token, username, region },
    urlInfo,
  } = res.locals

  const errors = []

  if (!recallType || !isValueValid(recallType as string, 'recallTypeExtended')) {
    const errorId = 'noRecallTypeExtendedSelected'
    errors.push(
      makeErrorObject({
        id: 'recallType',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      recallType,
    }
    return res.redirect(303, req.originalUrl)
  }

  if (recallType === 'NO_RECALL') {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.NO_RECALL_DECIDED],
      deActivate: [STATUSES.RECALL_DECIDED],
    })
  } else {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.RECALL_DECIDED],
      deActivate: [STATUSES.NO_RECALL_DECIDED],
    })
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      recallType: {
        selected: {
          value: recallType,
        },
        allOptions: formOptions.recallTypeExtended,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPageId = recallType === 'NO_RECALL' ? 'task-list-no-recall' : 'emergency-recall'
  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))

  const crn = normalizeCrn(req.body.crn)
  if (!isEmptyStringOrWhitespace(crn)) {
    appInsightsEvent(
      EVENTS.MRD_RECALL_TYPE,
      username,
      {
        recallType,
        crn,
        recommendationId,
        region,
      },
      flags
    )
  }
}

export default { get, post }
