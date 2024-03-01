import { NextFunction, Request, Response } from 'express'
import { getCaseSummaryV2, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesLicenceConditions } from '../recommendations/licenceConditions/inputDisplayValues'
import { CaseSummaryOverviewResponseV2 } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponseV2'
import { formOptions, isValueValid } from '../recommendations/formOptions/formOptions'
import { isCaseRestrictedOrExcluded, isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import raiseWarningBannerEvents from '../raiseWarningBannerEvents'
import { transformLicenceConditions } from '../caseSummary/licenceConditions/transformLicenceConditions'
import { cleanseUiList } from '../../utils/lists'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

const makeArray = (item: unknown) => (Array.isArray(item) ? item : [item])

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { username, region, token },
    flags: featureFlags,
  } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'licenceConditions',
    },
    inputDisplayValues: inputDisplayValuesLicenceConditions({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  const json = await getCaseSummaryV2<CaseSummaryOverviewResponseV2>(recommendation.crn, 'licence-conditions', token)

  res.locals.caseSummary = {
    ...json,
    licenceConvictions: {
      activeCustodial: json.activeConvictions.filter(
        conviction => conviction.sentence && conviction.sentence.isCustodial
      ),
      hasMultipleActiveCustodial:
        json.activeConvictions.filter(conviction => conviction.sentence?.isCustodial).length > 1,
    },
    standardLicenceConditions: formOptions.standardLicenceConditions,
  }

  raiseWarningBannerEvents(
    res.locals.caseSummary?.licenceConvictions?.activeCustodial?.length,
    res.locals.caseSummary?.hasAllConvictionsReleasedOnLicence,
    {
      username,
      region,
    },
    recommendation.crn,
    featureFlags
  )

  res.render(`pages/recommendations/licenceConditions`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { licenceConditionsBreached, activeCustodialConvictionCount, additionalLicenceConditionsText, crn } = req.body
  const {
    flags,
    user: { username, token, region },
    urlInfo,
  } = res.locals

  const hasAdditionalLicenceConditionsText: boolean = !!additionalLicenceConditionsText?.length

  const caseSummary = await getCaseSummaryV2<CaseSummaryOverviewResponseV2>(req.body.crn, 'licence-conditions', token)
  if (isCaseRestrictedOrExcluded(caseSummary.userAccessResponse)) {
    req.session.errors = [error('excludedRestrictedCrn')]
    return res.redirect(303, req.originalUrl)
  }

  let valuesToSave
  if (caseSummary?.cvlLicence) {
    const allSelectedConditions = isDefined(licenceConditionsBreached) ? makeArray(licenceConditionsBreached) : []

    if (allSelectedConditions.length === 0 && !hasAdditionalLicenceConditionsText) {
      req.session.errors = [error('noLicenceConditionsSelected')]
      return res.redirect(303, req.originalUrl)
    }

    const selectedStandardConditions = allSelectedConditions
      .filter(item => item.startsWith('standard|'))
      .map(item => item.replace('standard|', ''))

    const selectedAdditionalLicenceConditions = allSelectedConditions
      .filter(item => item.startsWith('additional|'))
      .map(item => item.replace('additional|', ''))

    const selectedBespokeLicenceConditions = allSelectedConditions
      .filter(item => item.startsWith('bespoke|'))
      .map(item => item.replace('bespoke|', ''))

    valuesToSave = {
      cvlLicenceConditionsBreached: {
        standardLicenceConditions: {
          selected: selectedStandardConditions,
          allOptions: caseSummary.cvlLicence.standardLicenceConditions.map(condition => ({
            code: condition.code,
            text: condition.text,
          })),
        },
        additionalLicenceConditions: {
          selected: selectedAdditionalLicenceConditions,
          allOptions: caseSummary.cvlLicence.additionalLicenceConditions.map(condition => ({
            code: condition.code,
            text: condition.text,
          })),
        },
        bespokeLicenceConditions: {
          selected: selectedBespokeLicenceConditions,
          allOptions: caseSummary.cvlLicence.bespokeConditions.map(condition => ({
            code: condition.code,
            text: condition.text,
          })),
        },
      },
      additionalLicenceConditionsText,
    }
  } else {
    const activeCustodialConvictionCountAsNumber = Number(activeCustodialConvictionCount)
    if (Number.isNaN(activeCustodialConvictionCountAsNumber)) {
      req.session.errors = [error('invalidConvictionCount')]
      return res.redirect(303, req.originalUrl)
    }

    const allSelectedConditions = isDefined(licenceConditionsBreached) ? makeArray(licenceConditionsBreached) : []

    const selectedStandardConditions = allSelectedConditions
      .filter(item => item.startsWith('standard|'))
      .map(item => item.replace('standard|', ''))

    const selectedAdditionalLicenceConditions = allSelectedConditions
      .filter(item => item.startsWith('additional|'))
      .map(item => {
        const [, mainCatCode, subCatCode] = item.split('|')
        return { mainCatCode, subCatCode }
      })

    const invalidStandardCondition = selectedStandardConditions.some(
      id => !isValueValid(id, 'standardLicenceConditions')
    )

    if (
      activeCustodialConvictionCountAsNumber === 1 &&
      ((allSelectedConditions.length === 0 && !hasAdditionalLicenceConditionsText) || invalidStandardCondition)
    ) {
      req.session.errors = [error('noLicenceConditionsSelected')]
      return res.redirect(303, req.originalUrl)
    }

    const { licenceConvictions } = transformLicenceConditions(caseSummary)
    if (licenceConvictions.hasMultipleActiveCustodial) {
      req.session.errors = [error('hasMultipleActiveCustodial')]
      return res.redirect(303, req.originalUrl)
    }
    if (!licenceConvictions.activeCustodial[0]) {
      req.session.errors = [error('noActiveCustodial')]
      return res.redirect(303, req.originalUrl)
    }

    const conviction = licenceConvictions.activeCustodial[0]
    const allAdditionalLicenceConditions = conviction.licenceConditions.map(condition => {
      return {
        mainCatCode: condition.mainCategory.code,
        subCatCode: condition.subCategory.code,
        title: condition.mainCategory.description,
        details: condition.subCategory.description,
        note: condition.notes,
      }
    })

    valuesToSave = {
      activeCustodialConvictionCount: activeCustodialConvictionCountAsNumber,
      licenceConditionsBreached: {
        standardLicenceConditions: {
          selected: selectedStandardConditions,
          allOptions: cleanseUiList(formOptions.standardLicenceConditions),
        },
        additionalLicenceConditions: {
          selectedOptions: selectedAdditionalLicenceConditions,
          allOptions: allAdditionalLicenceConditions,
        },
      },
      additionalLicenceConditionsText,
    }
  }

  if (hasAdditionalLicenceConditionsText) {
    appInsightsEvent(EVENTS.MRD_DELETED_RECOMMENDATION, username, { crn, recommendationId, region }, flags)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  if (urlInfo.originalUrl?.endsWith('/licence-conditions-ap')) {
    res.redirect(303, nextPageLinkUrl({ nextPageId: 'xyz', urlInfo }))
  } else {
    res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
  }
}

function error(errorId: string) {
  return makeErrorObject({
    id: 'licenceConditionsBreached',
    text: strings.errors[errorId],
    errorId,
  })
}

export default { get, post }
