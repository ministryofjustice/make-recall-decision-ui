import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationDecorated } from '../../@types/api'
import { AdditionalLicenceConditionOption } from '../../@types/make-recall-decision-api'
import logger from '../../../logger'
import { isDefined } from '../../utils/utils'

function extractStandardLicenceConditions(recommendation: RecommendationDecorated): Array<string> {
  if (recommendation.licenceConditionsBreached && recommendation.licenceConditionsBreached.standardLicenceConditions) {
    const { selected, allOptions } = recommendation.licenceConditionsBreached.standardLicenceConditions
    return selected
      .map((s: string) => {
        const option = allOptions.find((o: Record<string, string>) => o.value === s)
        if (option) {
          return option.text
        }
        logger.warn(`Delius selected value not found amongst available options: ${s}`)
        return undefined
      })
      .filter(isDefined)
  }

  if (
    recommendation.cvlLicenceConditionsBreached &&
    recommendation.cvlLicenceConditionsBreached.standardLicenceConditions
  ) {
    const { selected, allOptions } = recommendation.cvlLicenceConditionsBreached.standardLicenceConditions
    return selected
      .map((s: string) => {
        const option = allOptions.find((o: Record<string, string>) => o.code === s)
        if (option) {
          return option.text
        }
        logger.warn(`CVL standard selected value not found amongst available options: ${s}`)
        return undefined
      })
      .filter(isDefined)
  }
  return []
}

function extractAdditionalLicenceConditions(recommendation: RecommendationDecorated) {
  if (
    recommendation.licenceConditionsBreached &&
    recommendation.licenceConditionsBreached.additionalLicenceConditions
  ) {
    const { selectedOptions, allOptions } = recommendation.licenceConditionsBreached.additionalLicenceConditions
    return selectedOptions
      .map((s: { mainCatCode: string; subCatCode: string }) => {
        const option = allOptions.find(o => o.mainCatCode === s.mainCatCode && o.subCatCode === s.subCatCode)
        if (option) {
          return {
            title: option.title,
            details: option.details,
            note: option.note,
          }
        }
        logger.warn(`Delius additional selected value not found amongst available options: ${JSON.stringify(s)}`)
        return undefined
      })
      .filter(isDefined)
  }

  if (
    recommendation.cvlLicenceConditionsBreached &&
    recommendation.cvlLicenceConditionsBreached.additionalLicenceConditions
  ) {
    const { selected, allOptions } = recommendation.cvlLicenceConditionsBreached.additionalLicenceConditions
    return selected
      .map((s: string) => {
        const option = allOptions.find((o: Record<string, string>) => o.code === s)
        if (option) {
          return {
            title: option.text,
          }
        }
        logger.warn(`CVL additional selected value not found amongst available options: ${s}`)
        return undefined
      })
      .filter(isDefined)
  }

  return {
    selectedOptions: [] as Array<AdditionalLicenceConditionOption>,
    allOptions: [] as Array<AdditionalLicenceConditionOption>,
  }
}

function extractBespokeLicenceConditions(recommendation: RecommendationDecorated): Array<string> {
  if (
    recommendation.cvlLicenceConditionsBreached &&
    recommendation.cvlLicenceConditionsBreached.bespokeLicenceConditions
  ) {
    const { selected, allOptions } = recommendation.cvlLicenceConditionsBreached.bespokeLicenceConditions
    return selected
      .map((s: string) => {
        const option = allOptions.find((o: Record<string, string>) => o.code === s)
        if (option) {
          return option.text
        }
        logger.warn(`CVL bespoke selected value not found amongst available options: ${s}`)
        return undefined
      })
      .filter(isDefined)
  }

  return []
}

function extractAlternativeTried(recommendation: RecommendationDecorated) {
  const { selected, allOptions } = recommendation.alternativesToRecallTried || {
    selected: [],
    allOptions: [],
  }

  return selected
    .map((s: { value: string; details: string }) => {
      const option = allOptions.find((o: Record<string, string>) => o.value === s.value)
      if (option) {
        return {
          value: option.value,
          text: option.text,
          details: s.details,
        }
      }
      logger.warn(`Alternatives tried selected value not found amongst available options: ${JSON.stringify(s)}`)
      return undefined
    })
    .filter(isDefined)
}

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const alternativesToRecallTried = extractAlternativeTried(recommendation)
  const standardLicenceConditions = extractStandardLicenceConditions(recommendation)
  const additionalLicenceConditions = extractAdditionalLicenceConditions(recommendation)
  const bespokeLicenceConditions = extractBespokeLicenceConditions(recommendation)

  res.locals = {
    ...res.locals,
    page: {
      id: 'reviewPractitionersConcerns',
    },
    offenderName: recommendation.personOnProbation.name,
    triggerLeadingToRecall: recommendation.triggerLeadingToRecall,
    responseToProbation: recommendation.responseToProbation,
    standardLicenceConditions,
    additionalLicenceConditions,
    bespokeLicenceConditions,
    alternativesToRecallTried,
    isIndeterminateSentence: recommendation.isIndeterminateSentence ? 'Yes' : 'No',
    isExtendedSentence: recommendation.isExtendedSentence ? 'Yes' : 'No',
  }

  res.render(`pages/recommendations/reviewPractitionersConcerns`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      reviewPractitionersConcerns: true,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-task-list-consider-recall', urlInfo }))
}

export default { get, post }
