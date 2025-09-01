import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPagePreservingFromPageAndAnchor } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { isValueValid } from '../recommendations/formOptions/formOptions'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { NamedFormError, UrlInfo } from '../../@types/pagesForms'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import {
  isFixedTermRecallMandatoryForValueKeys,
  isFixedTermRecallMandatoryForRecommendation,
} from '../../utils/fixedTermRecallUtils'

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

  const caseSummary = {
    ...caseSummaryOverview,
    ...caseSummaryRisk,
  }

  // We're adding fields for MRD-2774 as part of the FTR48 changes
  // The FTR48 changes are conditionally hidden by the flagFtr48Updates feature flag
  // TODO: can we remove any inputs with displayForFTR48: true after the rollout?
  const pageId = flags.flagFtr48Updates ? 'ftr48SuitabilityForFixedTermRecall' : 'suitabilityForFixedTermRecall'
  const popName = recommendation.personOnProbation.name

  const inputDisplayValues = {
    isSentence48MonthsOrOver: {
      label: `Is ${popName}'s sentence 48 months or over?`,
      hint: `Use the total length if ${popName} is serving consecutive sentences.`,
      value: unsavedValues?.isSentence48MonthsOrOver || booleanToYesNo(recommendation.isSentence48MonthsOrOver),
      displayForFTR48: true,
    },
    isUnder18: {
      label: `Is ${popName} under 18?`,
      value: unsavedValues?.isUnder18 || booleanToYesNo(recommendation.isUnder18),
    },
    isSentence12MonthsOrOver: {
      label: `Is the sentence 12 months or over?`,
      value: unsavedValues?.isSentence12MonthsOrOver || booleanToYesNo(recommendation.isSentence12MonthsOrOver),
      displayForFTR48: false,
    },
    isMappaLevelAbove1: {
      label: `Is the MAPPA level above 1?`,
      value: unsavedValues?.isMappaLevelAbove1 || booleanToYesNo(recommendation.isMappaLevelAbove1),
      displayForFTR48: false,
    },
    hasBeenConvictedOfSeriousOffence: {
      label: `Has ${popName} been charged with a serious offence?`,
      value:
        unsavedValues?.hasBeenConvictedOfSeriousOffence ||
        booleanToYesNo(recommendation.hasBeenConvictedOfSeriousOffence),
      displayForFTR48: false,
    },
    isMappaCategory4: {
      label: `Is ${popName} in MAPPA category 4?`,
      value: unsavedValues?.isMappaCategory4 || booleanToYesNo(recommendation.isMappaCategory4),
      displayForFTR48: true,
    },
    isMappaLevel2Or3: {
      label: `Is ${popName}'s MAPPA level 2 or 3?`,
      value: unsavedValues?.isMappaLevel2Or3 || booleanToYesNo(recommendation.isMappaLevel2Or3),
      displayForFTR48: true,
    },
    isRecalledOnNewChargedOffence: {
      label: `Is ${popName} being recalled on a new charged offence?`,
      value:
        unsavedValues?.isRecalledOnNewChargedOffence || booleanToYesNo(recommendation.isRecalledOnNewChargedOffence),
      displayForFTR48: true,
    },
    isServingFTSentenceForTerroristOffence: {
      label: `Is ${popName} serving a fixed term sentence for a terrorist offence?`,
      value:
        unsavedValues?.isServingFTSentenceForTerroristOffence ||
        booleanToYesNo(recommendation.isServingFTSentenceForTerroristOffence),
      displayForFTR48: true,
    },
    hasBeenChargedWithTerroristOrStateThreatOffence: {
      label: `Has ${popName} been charged with a terrorist or state threat offence?`,
      value:
        unsavedValues?.hasBeenChargedWithTerroristOrStateThreatOffence ||
        booleanToYesNo(recommendation.hasBeenChargedWithTerroristOrStateThreatOffence),
      displayForFTR48: true,
    },
  }

  const warningPanel =
    recommendation.recallType !== null && !isFixedTermRecallMandatoryForRecommendation(recommendation)
      ? {
          title: 'Changes could affect your recall recommendation choices',
          body: `Changing your answers could make ${recommendation.personOnProbation.name} eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
        }
      : undefined

  res.locals = {
    ...res.locals,
    caseSummary,
    page: {
      id: pageId,
      warningPanel,
    },
    inputDisplayValues,
  }

  res.render(`pages/recommendations/suitabilityForFixedTermRecall`)
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
  const ftr48Enabled = flags?.flagFtr48Updates ?? false

  const errors: NamedFormError[] = []
  const valuesToSave: Record<string, unknown> = {}

  const fieldIds = ftr48Enabled
    ? [
        'isSentence48MonthsOrOver',
        'isUnder18',
        'isMappaCategory4',
        'isMappaLevel2Or3',
        'isRecalledOnNewChargedOffence',
        'isServingFTSentenceForTerroristOffence',
        'hasBeenChargedWithTerroristOrStateThreatOffence',
      ]
    : ['isUnder18', 'isSentence12MonthsOrOver', 'isMappaLevelAbove1', 'hasBeenConvictedOfSeriousOffence']

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
        })
      )
    } else {
      valuesToSave[key] = value === 'YES'
    }
  })

  const ftrMandatoryPreviously = ftr48Enabled && isFixedTermRecallMandatoryForRecommendation(recommendation)
  const ftrIsMandatoryUpdated =
    ftr48Enabled && isFixedTermRecallMandatoryForValueKeys(valuesToSave as Record<string, boolean>)
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

  res.redirect(303, nextPagePreservingFromPageAndAnchor({ pageUrlSlug: 'recall-type', urlInfo }))
}

export default { get, post }
