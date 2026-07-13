import { Request, Response, NextFunction } from 'express'
import chargedWithOffenceOptions from '../recommendations/chargedWithOffence/formOptions'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import ppPaths from '../../routes/paths/pp.paths'
import { sharedPaths } from '../../routes/paths/shared.paths'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { makeErrorObject } from '../../utils/errors'
import strings from '../../textStrings/en'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { stripHtmlTags } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'chargedWithOffence',
    },
    chargedWithOffenceOptions,
  }

  res.render('pages/recommendations/chargedWithOffence')
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    urlInfo,
    flags: featureFlags,
    user: { token },
    recommendation,
  } = res.locals

  const { isRecalledOnNewChargedOrConvictedOffence } = req.body

  if (!isRecalledOnNewChargedOrConvictedOffence) {
    const errorId = 'missingisRecalledOnNewChargedOrConvictedOffence'
    req.session.errors = [
      makeErrorObject({
        id: 'isRecalledOnNewChargedOrConvictedOffence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  let valuesToRemove: RecommendationResponse = {}

  if (
    recommendation?.isRecalledOnNewChargedOrConvictedOffence &&
    isRecalledOnNewChargedOrConvictedOffence !== recommendation?.isRecalledOnNewChargedOrConvictedOffence?.selected
  ) {
    valuesToRemove = {
      wasReferredToParoleBoard244ZB: null,
      wasRepatriatedForMurder: null,
      isServingSOPCSentence: null,
      isServingDCRSentence: null,
      isServingTerroristOrNationalSecurityOffence: null,
      isAtRiskOfInvolvedInForeignPowerThreat: null,
      isYouthSentenceOver12Months: null,
      isYouthChargedWithSeriousOffence: null,
      recallType: {
        selected: null,
        allOptions: [],
      },
      fixedTermAdditionalLicenceConditions: {
        selected: null,
        details: null,
      },
    }
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      ...valuesToRemove,
      isRecalledOnNewChargedOrConvictedOffence: {
        selected: isRecalledOnNewChargedOrConvictedOffence,
        allOptions: [
          ...chargedWithOffenceOptions.map(option => ({ value: option.value, text: stripHtmlTags(option.html) })),
        ],
      },
    },
    token,
    featureFlags,
  })

  const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/${ppPaths.suitabilityForFixedTermRecall}`
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
