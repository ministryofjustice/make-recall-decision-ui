import {
  CaseSummaryOverviewResponse,
  Conviction,
  LicenceCondition,
  LicenceConditionsResponse,
  UserAccessResponse,
} from '../../../@types/make-recall-decision-api'
import { sortListByDateField } from '../../../utils/dates'
import { formOptions } from '../../recommendations/formOptions/formOptions'
import { sortList } from '../../../utils/lists'
import { FormOption } from '../../../@types/pagesForms'

const transformConviction = (conviction: Conviction) => {
  return {
    ...conviction,
    isCustodial: conviction.sentence && conviction.sentence?.isCustodial,
    licenceConditions: conviction.licenceConditions
      ? sortList(conviction.licenceConditions, 'mainCategory.description', true)
      : [],
  }
}

export interface DecoratedConviction extends Conviction {
  isCustodial?: boolean
  licenceConditions?: LicenceCondition[]
}

export interface TransformedLicenceConditionsResponse {
  userAccessResponse?: UserAccessResponse
  licenceConvictions?: {
    active: DecoratedConviction[]
    activeCustodial: DecoratedConviction[]
    hasMultipleActiveCustodial: boolean
  }
  hasAllConvictionsReleasedOnLicence: boolean
  standardLicenceConditions?: FormOption[]
}

export const transformLicenceConditions = (
  caseSummary: LicenceConditionsResponse | CaseSummaryOverviewResponse
): TransformedLicenceConditionsResponse => {
  let activeConvictions: DecoratedConviction[] = []
  let activeCustodialConvictions: DecoratedConviction[] = []
  let hasAllConvictionsReleasedOnLicence = false
  if (caseSummary.activeConvictions) {
    activeConvictions = caseSummary.activeConvictions.map(conviction => transformConviction(conviction))
    activeCustodialConvictions = activeConvictions.filter(conviction => conviction.sentence?.isCustodial)
    hasAllConvictionsReleasedOnLicence = activeCustodialConvictions.every(
      conviction => conviction.sentence?.custodialStatusCode === 'B'
    )
    activeConvictions = sortListByDateField({
      list: activeConvictions,
      dateKey: 'sentence.sentenceExpiryDate',
      newestFirst: true,
      undefinedValuesLast: true,
    })
  }
  return {
    ...caseSummary,
    licenceConvictions: {
      active: activeConvictions,
      activeCustodial: activeCustodialConvictions,
      hasMultipleActiveCustodial: activeCustodialConvictions.length > 1,
    },
    hasAllConvictionsReleasedOnLicence,
    standardLicenceConditions: formOptions.standardLicenceConditions,
  }
}
