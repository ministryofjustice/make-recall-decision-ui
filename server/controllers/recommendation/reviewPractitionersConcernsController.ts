import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationDecorated } from '../../@types/api'

function extractStandardLicenceConditions(recommendation: RecommendationDecorated) {
  const { selected, allOptions } = recommendation.licenceConditionsBreached?.standardLicenceConditions || {
    selected: [],
    allOptions: [],
  }

  return selected.map((s: string) => allOptions.find((o: Record<string, string>) => o.value === s).text)
}

function extractAdditionalLicenceConditions(recommendation: RecommendationDecorated) {
  const { selectedOptions, allOptions } = recommendation.licenceConditionsBreached?.additionalLicenceConditions || {
    selectedOptions: [],
    allOptions: [],
  }

  return selectedOptions.map((s: { mainCatCode: string; subCatCode: string }) => {
    const option = allOptions.find(o => o.mainCatCode === s.mainCatCode && o.subCatCode === s.subCatCode)
    return {
      title: option.title,
      details: option.details,
      note: option.note,
    }
  })
}

function extractAlternativeTried(recommendation: RecommendationDecorated) {
  const { selected, allOptions } = recommendation.alternativesToRecallTried || {
    selected: [],
    allOptions: [],
  }

  return selected.map((s: { value: string; details: string }) => {
    const option = allOptions.find((o: Record<string, string>) => o.value === s.value)

    return {
      value: option.value,
      text: option.text,
      details: s.details,
    }
  })
}

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const alternativesToRecallTried = extractAlternativeTried(recommendation)
  const standardLicenceConditions = extractStandardLicenceConditions(recommendation)
  const additionalLicenceConditions = extractAdditionalLicenceConditions(recommendation)

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
