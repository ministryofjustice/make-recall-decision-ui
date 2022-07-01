import { Request, Response } from 'express'
import { getRecommendation, saveRecommendation } from './utils/persistedRecommendation'
import { alternativesToRecallRefData } from './refData/alternativesToRecallRefData'
import { custodyOptions } from './refData/custodyOptions'
import { recallTypes } from './refData/recallTypes'
import { yesNo } from './refData/yesNo'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { ContactSummaryResponse, PersonDetailsResponse } from '../../@types/make-recall-decision-api'

const getRefData = () => ({
  alternativesToRecall: alternativesToRecallRefData,
  custodyOptions,
  recallTypes,
  yesNo,
})

const getPageData = (sectionId: string) => {
  switch (sectionId) {
    case 'alternatives':
      return {
        pageTemplate: 'alternatives',
        nextPageId: 'recall-type',
      }
    case 'recall-type':
      return {
        pageTemplate: 'recallType',
        nextPageId: 'custody',
      }
    case 'custody':
      return {
        pageTemplate: 'custody',
        nextPageId: 'summary',
      }
    case 'behaviour':
      return {
        pageTemplate: 'behaviour',
        nextPageId: 'select-contacts',
      }
    case 'cause':
      return {
        pageTemplate: 'cause',
        nextPageId: 'summary',
      }
    case 'personal-details':
      return {
        pageTemplate: 'personalDetails',
        nextPageId: 'summary',
      }
    case 'summary':
      return {
        pageTemplate: 'summary',
      }
    case 'clear-data':
      return {
        pageTemplate: 'clearData',
        nextPageId: 'summary',
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

interface SelectableLicenceCondition {
  id: string
  text: string
  description: string
}

interface SavedRecommendation {
  recallType: string
  custodyOption: string
  alternativesTried: string | string[]
  behaviour: string
  cause: string
  addressConfirmed: string
  addressConfirmedDetail: string
  contacts: ContactSummaryResponse[]
  licenceConditions: SelectableLicenceCondition[]
}

const decorateRecommendation = (recommendation: SavedRecommendation) => {
  if (!recommendation) {
    return {
      alternativesTriedAllOptions: alternativesToRecallRefData,
    }
  }
  const {
    recallType,
    custodyOption,
    alternativesTried,
    behaviour,
    cause,
    addressConfirmed,
    addressConfirmedDetail,
    contacts,
    licenceConditions,
  } = recommendation
  const alternatives = Array.isArray(alternativesTried) || !alternativesTried ? alternativesTried : [alternativesTried]
  return {
    recallType: recallType && recallTypes.find(type => type.value === recallType),
    custodyOption: custodyOptions.find(type => type.value === custodyOption),
    behaviour,
    cause,
    addressConfirmed: yesNo.find(type => type.value === addressConfirmed),
    addressConfirmedDetail,
    alternativesTried:
      alternatives &&
      (alternatives as Array<string>).map(alt => ({
        ...(alternativesToRecallRefData.find(type => type.value === alt) || {}),
        detail: recommendation[`alternativesTriedDetail-${alt}`],
      })),
    alternativesTriedAllOptions: alternativesToRecallRefData.map(type => ({
      ...type,
      checked: Boolean(alternatives && (alternatives as Array<string>).find(alt => alt === type.value)),
      detail: recommendation[`alternativesTriedDetail-${type.value}`],
    })),
    contacts,
    licenceConditions,
  }
}

export const recommendationFormGet = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  const crnFormatted = (crn as string).toUpperCase()

  const recommendation = await getRecommendation(crnFormatted)
  const caseSummary = await getCaseSummary<PersonDetailsResponse>(
    crnFormatted,
    'personal-details',
    res.locals.user.token
  )
  res.locals = {
    ...res.locals,
    refData: getRefData(),
    personalDetailsOverview: caseSummary.personalDetailsOverview,
    currentAddress: caseSummary.currentAddress,
    crn: crnFormatted,
    pageUrlBase: `/recommendation/${crn}/`,
    recommendation: decorateRecommendation(recommendation),
  }
  const pageData = getPageData(sectionId)
  res.render(`pages/recommendation/${pageData.pageTemplate}`)
}

export const recommendationFormPost = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  const { _csrf, ...rest } = req.body
  const crnFormatted = (crn as string).toUpperCase()
  let updated = {}
  if (sectionId !== 'clear-data') {
    const existing = await getRecommendation(crnFormatted)
    updated = {
      ...(existing || {}),
      ...rest,
    }
  }
  saveRecommendation({ data: updated, crn: crnFormatted })
  res.redirect(303, getNextPageUrl({ crn: crnFormatted, sectionId }))
}
