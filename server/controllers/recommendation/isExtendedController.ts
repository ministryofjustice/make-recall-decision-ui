import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { isValueValid } from '../recommendations/formOptions/formOptions'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'isExtendedSentence',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.isExtendedSentence ? '' : booleanToYesNo(recommendation.isExtendedSentence),
    },
  }

  res.render(`pages/recommendations/isExtendedSentence`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { isExtendedSentence, currentSavedValue } = req.body

  if (!isExtendedSentence || !isValueValid(isExtendedSentence as string, 'yesNo')) {
    const errorId = 'noIsExtendedSelected'
    req.session.errors = [
      makeErrorObject({
        id: 'isExtendedSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  // if the Out of Hours (Approved Premises) people have recorded a rationale.
  const isApRationalRecorded = (res.locals.statuses as RecommendationStatusResponse[]).find(
    status => status.name === STATUSES.AP_RECORDED_RATIONALE && status.active
  )

  const isIndeterminateSentence = req.body.isIndeterminateSentence === '1'
  const isNo = isExtendedSentence === 'NO'
  const isYes = isExtendedSentence === 'YES'
  const changedToNo = isNo && currentSavedValue === 'YES'
  const changedToYes = isYes && currentSavedValue === 'NO'

  let valuesToSave

  if (!isIndeterminateSentence && (changedToNo || changedToYes)) {
    valuesToSave = {
      isExtendedSentence: isYes,
      indeterminateSentenceType: null,
      indeterminateOrExtendedSentenceDetails: null,
      recallType: null,
      isThisAnEmergencyRecall: null,
    }
  } else {
    valuesToSave = {
      isExtendedSentence: isYes,
    }
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  let nextPageId
  if (isIndeterminateSentence) {
    nextPageId = 'indeterminate-type'
  } else if (isApRationalRecorded) {
    if (isYes) {
      nextPageId = 'recall-type-extended'
    } else {
      nextPageId = 'recall-type'
    }
  } else {
    nextPageId = 'task-list-consider-recall'
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
