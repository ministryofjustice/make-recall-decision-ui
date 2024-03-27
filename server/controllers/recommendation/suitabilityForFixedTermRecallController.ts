import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { isValueValid } from '../recommendations/formOptions/formOptions'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { getCaseSection } from '../caseSummary/getCaseSection'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token, userId },
    flags,
    unsavedValues,
  } = res.locals

  const { caseSummary } = await getCaseSection('overview', recommendation.crn, token, userId, req.query, flags)

  const inputDisplayValues = {
    errors: res.locals.errors,
    isOver18: unsavedValues?.isOver18 || booleanToYesNo(recommendation.isOver18),
    isSentenceUnder12Months:
      unsavedValues?.isSentenceUnder12Months || booleanToYesNo(recommendation.isSentenceUnder12Months),
    isMappaLevelAbove1: unsavedValues?.isMappaLevelAbove1 || booleanToYesNo(recommendation.isMappaLevelAbove1),
    hasBeenConvictedOfSeriousOffence:
      unsavedValues?.hasBeenConvictedOfSeriousOffence ||
      booleanToYesNo(recommendation.hasBeenConvictedOfSeriousOffence),
  }

  res.locals = {
    ...res.locals,
    caseSummary,
    page: {
      id: 'suitabilityForFixedTermRecall',
    },
    inputDisplayValues,
  }

  res.render(`pages/recommendations/suitabilityForFixedTermRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { isOver18, isSentenceUnder12Months, isMappaLevelAbove1, hasBeenConvictedOfSeriousOffence } = req.body

  const errors = []
  const unsavedValues = {
    isOver18,
    isSentenceUnder12Months,
    isMappaLevelAbove1,
    hasBeenConvictedOfSeriousOffence,
  }

  if (!isOver18 || !isValueValid(isOver18 as string, 'yesNo')) {
    const errorId = 'noIsOver18'
    errors.push(
      makeErrorObject({
        id: 'isOver18',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isSentenceUnder12Months || !isValueValid(isSentenceUnder12Months as string, 'yesNo')) {
    const errorId = 'noIsSentenceUnder12Months'
    errors.push(
      makeErrorObject({
        id: 'isSentenceUnder12Months',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isMappaLevelAbove1 || !isValueValid(isMappaLevelAbove1 as string, 'yesNo')) {
    const errorId = 'noIsMappaLevelAbove1'
    errors.push(
      makeErrorObject({
        id: 'isMappaLevelAbove1',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!hasBeenConvictedOfSeriousOffence || !isValueValid(hasBeenConvictedOfSeriousOffence as string, 'yesNo')) {
    const errorId = 'noHasBeenConvictedOfSeriousOffence'
    errors.push(
      makeErrorObject({
        id: 'hasBeenConvictedOfSeriousOffence',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  const valuesToSave = {
    isOver18: isOver18 === 'YES',
    isMappaLevelAbove1: isMappaLevelAbove1 === 'YES',
    isSentenceUnder12Months: isSentenceUnder12Months === 'YES',
    hasBeenConvictedOfSeriousOffence: hasBeenConvictedOfSeriousOffence === 'YES',
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo }))
}

export default { get, post }
