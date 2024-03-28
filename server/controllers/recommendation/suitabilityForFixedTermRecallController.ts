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

  const { caseSummary: caseSummaryOverview } = await getCaseSection(
    'overview',
    recommendation.crn,
    token,
    userId,
    req.query,
    flags
  )
  const { caseSummary: caseSummaryRisk } = await getCaseSection(
    'risk',
    recommendation.crn,
    token,
    userId,
    req.query,
    flags
  )

  const inputDisplayValues = {
    errors: res.locals.errors,
    isUnder18: unsavedValues?.isUnder18 || booleanToInvertedYesNo(recommendation.isOver18),
    isSentence12MonthsOrOver:
      unsavedValues?.isSentence12MonthsOrOver || booleanToInvertedYesNo(recommendation.isSentenceUnder12Months),
    isMappaLevelAbove1: unsavedValues?.isMappaLevelAbove1 || booleanToYesNo(recommendation.isMappaLevelAbove1),
    hasBeenConvictedOfSeriousOffence:
      unsavedValues?.hasBeenConvictedOfSeriousOffence ||
      booleanToYesNo(recommendation.hasBeenConvictedOfSeriousOffence),
  }

  const caseSummary = {
    ...caseSummaryOverview,
    ...caseSummaryRisk,
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

  const { isUnder18, isSentence12MonthsOrOver, isMappaLevelAbove1, hasBeenConvictedOfSeriousOffence } = req.body

  const errors = []
  const unsavedValues = {
    isUnder18,
    isSentence12MonthsOrOver,
    isMappaLevelAbove1,
    hasBeenConvictedOfSeriousOffence,
  }

  if (!isUnder18 || !isValueValid(isUnder18 as string, 'yesNo')) {
    const errorId = 'noIsUnder18'
    errors.push(
      makeErrorObject({
        id: 'isUnder18',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isSentence12MonthsOrOver || !isValueValid(isSentence12MonthsOrOver as string, 'yesNo')) {
    const errorId = 'noIsSentence12MonthsOrOver'
    errors.push(
      makeErrorObject({
        id: 'isSentence12MonthsOrOver',
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
    isOver18: isUnder18 === 'NO',
    isMappaLevelAbove1: isMappaLevelAbove1 === 'YES',
    isSentenceUnder12Months: isSentence12MonthsOrOver === 'NO',
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

export const booleanToInvertedYesNo = (val: boolean) => {
  if (val === true) return 'NO'
  if (val === false) return 'YES'
  return undefined
}
