import { Request, Response } from 'express'
import { getRecommendation, saveRecommendation } from './utils/persistedRecommendation'
import { alternativesToRecallRefData } from './refData/alternativesToRecallRefData'
import { custodyOptions } from './refData/custodyOptions'
import { recallTypes } from './refData/recallTypes'
import { yesNo } from './refData/yesNo'
import { vulnerabilityRefData } from './refData/vulnerability'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import {
  ContactSummaryResponse,
  PersonDetailsResponse,
  LicenceConditionsResponse,
  ConvictionResponse,
} from '../../@types/make-recall-decision-api'
import { standardLicenceConditionsRefData } from './refData/licenceConditions'
import { AppError } from '../../AppError'

const getRefData = () => ({
  alternativesToRecall: alternativesToRecallRefData,
  custodyOptions,
  recallTypes,
  yesNo,
  standardLicenceConditions: standardLicenceConditionsRefData,
  vulnerability: vulnerabilityRefData,
})

const getPageData = (sectionId: string, recommendation: SavedRecommendation) => {
  switch (sectionId) {
    case 'behaviour':
      return {
        pageTemplate: 'behaviour',
        nextPageId: 'licence-conditions',
      }
    case 'licence-conditions':
      return {
        pageTemplate: 'licenceConditions',
        nextPageId: 'alternatives',
      }
    case 'alternatives':
      return {
        pageTemplate: 'alternatives',
        nextPageId: 'stop-think',
      }
    case 'stop-think':
      return {
        pageTemplate: 'stopThink',
        nextPageId: 'recall-type',
      }
    case 'recall-type':
      return {
        pageTemplate: 'recallType',
        nextPageId: recommendation.recallType === 'NO_RECALL' ? 'no-recall-letter-start' : 'sensitive',
      }
    case 'sensitive':
      return {
        pageTemplate: 'sensitive',
      }
    case 'emergency-recall':
      return {
        pageTemplate: 'emergencyRecall',
        nextPageId: 'custody',
      }
    case 'custody':
      return {
        pageTemplate: 'custody',
        nextPageId: 'summary',
      }
    case 'cause':
      return {
        pageTemplate: 'cause',
        nextPageId: 'summary',
      }
    case 'vulnerability':
      return {
        pageTemplate: 'vulnerability',
        nextPageId: 'summary',
      }
    case 'address':
      return {
        pageTemplate: 'address',
        nextPageId: 'summary',
      }
    case 'summary':
      return {
        pageTemplate: 'summary',
      }
    case 'police':
      return {
        pageTemplate: 'police',
        nextPageId: 'summary',
      }
    case 'iom':
      return {
        pageTemplate: 'iom',
        nextPageId: 'summary',
      }
    case 'arrest-issues':
      return {
        pageTemplate: 'arrestIssues',
        nextPageId: 'summary',
      }
    case 'victim-contact-scheme':
      return {
        pageTemplate: 'victimContactScheme',
        nextPageId: 'victim-liaison-officer',
      }
    case 'victim-liaison-officer':
      return {
        pageTemplate: 'victimLiaisonOfficer',
        nextPageId: 'summary',
      }
    case 'contraband':
      return {
        pageTemplate: 'contraband',
        nextPageId: 'summary',
      }
    case 'risk-profile':
      return {
        pageTemplate: 'riskProfile',
        nextPageId: 'summary',
      }
    case 'confirmation-recall':
      return {
        pageTemplate: 'confirmationRecall',
      }
    case 'no-recall-letter-start':
      return {
        pageTemplate: 'noRecallLetterStart',
        nextPageId: 'no-recall-reasons',
      }
    case 'no-recall-reasons':
      return {
        pageTemplate: 'noRecallReasons',
        nextPageId: 'no-recall-appointment',
      }
    case 'no-recall-appointment':
      return {
        pageTemplate: 'noRecallAppointment',
        nextPageId: 'no-recall-preview',
      }
    case 'no-recall-preview':
      return {
        pageTemplate: 'noRecallPreview',
        nextPageId: 'no-recall-confirmation',
      }
    case 'no-recall-confirmation':
      return {
        pageTemplate: 'noRecallConfirmation',
      }
    case 'clear-data':
      return {
        pageTemplate: 'clearData',
        nextPageId: 'summary',
      }
    default:
      throw new AppError(`recommendation: invalid sectionId: ${sectionId}`, { status: 404 })
  }
}

const getPageUrl = ({ crn, sectionId }: { crn: string; sectionId: string }) => {
  return `/rec-prototype/${crn}/${sectionId}`
}

const getNextPageUrl = ({
  crn,
  sectionId,
  recommendation,
}: {
  crn: string
  sectionId: string
  recommendation: SavedRecommendation
}) => {
  const { nextPageId } = getPageData(sectionId, recommendation)
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
  vulnerability: string | string[]
  behaviour: string
  cause: string
  emergencyRecall: string
  addressConfirmed: string
  addressConfirmedDetail: string
  contacts: ContactSummaryResponse[]
  standardLicenceConditions: SelectableLicenceCondition[]
  additionalLicenceConditions: SelectableLicenceCondition[]
  additionalLicenceConditionsDetail: string
  policeName: string
  policeEmail: string
  policePhoneNumber: string
  policeFaxNumber: string
  iom: string
  iomDetailYes: string
  arrestIssues: string
  arrestIssuesDetailYes: string
  contraband: string
  contrabandDetailYes: string
}

const decorateRecommendation = (recommendation: SavedRecommendation, newestActiveConviction: ConvictionResponse) => {
  if (!recommendation) {
    return {
      alternativesTriedAllOptions: alternativesToRecallRefData,
    }
  }
  const {
    recallType,
    emergencyRecall,
    custodyOption,
    alternativesTried,
    behaviour,
    cause,
    addressConfirmed,
    addressConfirmedDetail,
    contacts,
    standardLicenceConditions,
    additionalLicenceConditions,
    additionalLicenceConditionsDetail,
    vulnerability,
    policeName,
    policeEmail,
    policePhoneNumber,
    policeFaxNumber,
    iom,
    iomDetailYes,
    arrestIssues,
    arrestIssuesDetailYes,
    contraband,
    contrabandDetailYes,
  } = recommendation
  const alternatives = Array.isArray(alternativesTried) || !alternativesTried ? alternativesTried : [alternativesTried]
  const vulnerabilityList = Array.isArray(vulnerability) || !vulnerability ? vulnerability : [vulnerability]
  return {
    recallType: recallType && recallTypes.find(type => type.value === recallType),
    custodyOption: custodyOptions.find(type => type.value === custodyOption),
    behaviour,
    cause,
    emergencyRecall: yesNo.find(type => type.value === emergencyRecall),
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
    vulnerability,
    vulnerabilityAllOptions: vulnerabilityRefData.map(type => ({
      ...type,
      checked: Boolean(vulnerabilityList && (vulnerabilityList as Array<string>).find(alt => alt === type.value)),
      detail: recommendation[`vulnerabilityDetail-${type.value}`],
    })),
    contacts,
    standardLicenceConditions,
    additionalLicenceConditions,
    additionalLicenceConditionsDetail,
    additionalLicenceConditionsAllOptions: newestActiveConviction.licenceConditions.map(cond => ({
      id: cond.licenceConditionTypeSubCat.code,
      text: cond.licenceConditionTypeMainCat.description,
      label: {
        classes: 'govuk-!-font-weight-bold',
      },
      hint: {
        text: cond.licenceConditionTypeSubCat.description,
      },
    })),
    policeName,
    policeEmail,
    policePhoneNumber,
    policeFaxNumber,
    iom,
    iomDetailYes,
    arrestIssues,
    arrestIssuesDetailYes,
    contraband,
    contrabandDetailYes,
  }
}

export const recommendationFormGet = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  const crnFormatted = (crn as string).toUpperCase()

  const recommendation = await getRecommendation(crnFormatted)
  const [licenceResponse, personalResponse] = await Promise.allSettled([
    getCaseSummary<LicenceConditionsResponse>(crnFormatted, 'licence-conditions', res.locals.user.token),
    getCaseSummary<PersonDetailsResponse>(crnFormatted, 'personal-details', res.locals.user.token),
  ])
  const personalDetails = (personalResponse as PromiseFulfilledResult<PersonDetailsResponse>).value
  const newestActiveConviction = (licenceResponse as PromiseFulfilledResult<LicenceConditionsResponse>).value
    .convictions[0]
  res.locals = {
    ...res.locals,
    refData: getRefData(),
    personalDetailsOverview: personalDetails.personalDetailsOverview,
    currentAddress: personalDetails.currentAddress,
    crn: crnFormatted,
    pageUrlBase: `/rec-prototype/${crn}/`,
    recommendation: decorateRecommendation(recommendation, newestActiveConviction),
  }
  const pageData = getPageData(sectionId, recommendation)
  res.render(`pages/rec-prototype/${pageData.pageTemplate}`)
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
  res.redirect(303, getNextPageUrl({ crn: crnFormatted, sectionId, recommendation: rest }))
}
