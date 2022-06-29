import { Request, Response } from 'express'
import { getRecommendation, saveRecommendation } from './utils/persistedRecommendation'
import { alternativesToRecallRefData } from './refData/alternativesToRecallRefData'
import { custodyOptions } from './refData/custodyOptions'
import { recallTypes } from './refData/recallTypes'

const getRefData = () => ({
  alternativesToRecall: alternativesToRecallRefData,
  custodyOptions,
  recallTypes,
})

const getPageData = (sectionId: string) => {
  switch (sectionId) {
    case 'recall-type':
      return {
        pageTemplate: 'recallType',
        nextPageId: 'alternatives',
      }
    case 'alternatives':
      return {
        pageTemplate: 'alternatives',
        nextPageId: 'custody',
      }
    case 'custody':
      return {
        pageTemplate: 'custody',
        nextPageId: 'summary',
      }
    case 'summary':
      return {
        pageTemplate: 'summary',
      }
    default:
      throw new Error(`Invalid sectionId: ${sectionId}`)
  }
}

const getPageUrl = ({ crn, sectionId }: { crn: string; sectionId: string }) => {
  return `/recommendation/${crn}/${sectionId}`
}

const getNextPageUrl = ({ crn, sectionId }: { crn: string; sectionId: string }) => {
  const { nextPageId } = getPageData(sectionId)
  return getPageUrl({ crn, sectionId: nextPageId })
}

interface SavedRecommendation {
  recallType: string
  custodyOption: string
  alternativesTried: string | string[]
}

const decorateRecommendation = (recommendation: SavedRecommendation) => {
  const { recallType, custodyOption, alternativesTried } = recommendation
  const alternatives = Array.isArray(alternativesTried) || !alternativesTried ? alternativesTried : [alternativesTried]
  return {
    recallType: recallType && recallTypes.find(type => type.value === recallType),
    custodyOption: custodyOptions.find(type => type.value === custodyOption),
    alternativesTried:
      alternatives &&
      (alternatives as Array<string>).map(alt => ({
        ...(alternativesToRecallRefData.find(type => type.value === alt) || {}),
        detail: recommendation[`alternativesTriedDetail-${alt}`],
      })),
  }
}

export const recommendationFormGet = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  const crnFormatted = (crn as string).toUpperCase()

  const recommendation = await getRecommendation(crnFormatted)
  res.locals = {
    ...res.locals,
    refData: getRefData(),
    crn: crnFormatted,
    pageUrlBase: `/recommendation/${crn}/`,
    recommendation: recommendation && decorateRecommendation(recommendation),
  }
  const pageData = getPageData(sectionId)
  res.render(`pages/recommendation/${pageData.pageTemplate}`)
}

export const recommendationFormPost = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  const { _csrf, ...rest } = req.body
  const crnFormatted = (crn as string).toUpperCase()

  const existing = await getRecommendation(crnFormatted)
  const updated = {
    ...(existing || {}),
    ...rest,
  }
  saveRecommendation({ data: updated, crn: crnFormatted })
  res.redirect(303, getNextPageUrl({ crn: crnFormatted, sectionId }))
}
