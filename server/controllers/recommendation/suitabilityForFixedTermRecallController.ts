import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPagePreservingFromPageAndAnchor } from '../recommendations/helpers/urls'
import { isValueValid } from '../recommendations/formOptions/formOptions'
import { makeErrorObject } from '../../utils/errors'
import strings from '../../textStrings/en'
import getCaseSection from '../caseSummary/getCaseSection'
import { NamedFormError, UrlInfo } from '../../@types/pagesForms'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import {
  isFixedTermRecallMandatoryForValueKeys,
  isFixedTermRecallMandatoryForRecommendation,
} from '../../utils/fixedTermRecallUtils'
import suitabilityInputDisplayValues from '../recommendations/suitabilityForFixedTermRecall/inputDisplayValues'
import getFormOptions from '../recommendations/suitabilityForFixedTermRecall/formOptions'
import getSentenceGroupDetailsFromEnum from '../recommendations/helpers/getSentenceGroupDetails'

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
    flags,
  )
  const { caseSummary: caseSummaryRisk } = await getCaseSection(
    'risk',
    recommendation.crn,
    token,
    userId,
    req.query,
    flags,
  )

  const caseSummary = {
    ...caseSummaryOverview,
    ...caseSummaryRisk,
  }

  const formOptions = getFormOptions(
    flags.flagFTR56Enabled,
    recommendation.personOnProbation.name,
    recommendation.sentenceGroup,
  )

  const inputDisplayValues = suitabilityInputDisplayValues(formOptions, unsavedValues, recommendation)

  const warningPanel =
    recommendation.recallType !== null && !isFixedTermRecallMandatoryForRecommendation(recommendation)
      ? {
          title: 'Changes could affect your recall recommendation choices',
          body: `Changing your answers could make ${recommendation.personOnProbation.name} eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
        }
      : undefined

  res.locals = {
    ...res.locals,
    page: {
      id: 'suitabilityForFixedTermRecall',
      warningPanel,
    },
    caseSummary,
    inputDisplayValues,
    sentenceGroupDetails: getSentenceGroupDetailsFromEnum(recommendation.sentenceGroup),
  }

  if (flags.flagFTR56Enabled) {
    res.render('pages/recommendations/suitabilityForFixedTermRecall-ftr56')
  } else {
    res.render(`pages/recommendations/suitabilityForFixedTermRecall`)
  }
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    flags,
    user: { token },
    urlInfo,
  } = res.locals as {
    recommendation: RecommendationResponse
    flags: Record<string, boolean>
    user: { token: string }
    urlInfo: UrlInfo
  }

  const errors: NamedFormError[] = []
  const valuesToSave: Record<string, unknown> = {}

  const fieldIds = Object.keys(
    getFormOptions(flags.flagFTR56Enabled, recommendation.personOnProbation.name, recommendation.sentenceGroup),
  )

  const unsavedValues = Object.fromEntries(fieldIds.map(key => [key, req.body[key]]))

  // Loop through the unsaved values to generate an array of errors
  Object.entries(unsavedValues).forEach(([key, value]) => {
    if (!value || !isValueValid(value as string, 'yesNo')) {
      // Capitalise the first letter of the key to fit the noFieldName format
      const formatId = key.charAt(0).toUpperCase() + key.slice(1)
      const errorId = `no${formatId}`
      errors.push(
        makeErrorObject({
          id: key,
          text: strings.errors[errorId],
          errorId,
        }),
      )
    } else {
      valuesToSave[key] = value === 'YES'
    }
  })

  const ftrMandatoryPreviously = isFixedTermRecallMandatoryForRecommendation(recommendation)
  const ftrIsMandatoryUpdated = isFixedTermRecallMandatoryForValueKeys(valuesToSave as Record<string, boolean>)
  if (ftrMandatoryPreviously && !ftrIsMandatoryUpdated) {
    valuesToSave.recallType = {
      ...recommendation.recallType,
      selected: {
        value: recommendation.recallType?.selected.value,
      },
    }
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  return res.redirect(303, nextPagePreservingFromPageAndAnchor({ pageUrlSlug: 'recall-type', urlInfo }))
}

export default { get, post }
