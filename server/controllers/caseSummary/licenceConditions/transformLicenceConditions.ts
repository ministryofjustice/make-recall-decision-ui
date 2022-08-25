import {
  ConvictionResponse,
  LicenceCondition,
  LicenceConditionsResponse,
  UserAccessResponse,
} from '../../../@types/make-recall-decision-api'
import { sortListByDateField } from '../../../utils/dates'
import { formOptions } from '../../recommendations/helpers/formOptions'
import { sortList } from '../../../utils/lists'
import { FormOption } from '../../../@types'

const transformConviction = (conviction: ConvictionResponse) => {
  const licenceConditions = conviction.licenceConditions
    ? conviction.licenceConditions.filter(condition => condition.active === true)
    : []
  return {
    ...conviction,
    offences: {
      main: conviction.offences.filter(offence => offence.mainOffence).map(offence => offence.description),
      additional: conviction.offences.filter(offence => !offence.mainOffence).map(offence => offence.description),
    },
    licenceConditions: sortList(licenceConditions, 'licenceConditionTypeMainCat.description', true),
  }
}

export interface DecoratedConviction {
  convictionId?: number
  active?: boolean
  isCustodial?: boolean
  licenceExpiryDate?: string
  sentenceExpiryDate?: string
  offences: {
    main: string[]
    additional: string[]
  }
  licenceConditions?: LicenceCondition[]
}

export interface TransformedLicenceConditionsResponse {
  userAccessResponse?: UserAccessResponse
  convictions?: {
    active: DecoratedConviction[]
    activeCustodial: DecoratedConviction[]
    hasMultipleActiveCustodial: boolean
  }
  standardLicenceConditions?: FormOption[]
}

export const transformLicenceConditions = (
  caseSummary: LicenceConditionsResponse
): TransformedLicenceConditionsResponse => {
  let activeConvictions: DecoratedConviction[] = []
  let activeCustodialConvictions: DecoratedConviction[] = []
  if (caseSummary.convictions) {
    activeConvictions = caseSummary.convictions
      .filter(conviction => conviction.active)
      .map(conviction => transformConviction(conviction))
    activeCustodialConvictions = activeConvictions.filter(conviction => conviction.isCustodial)
    activeConvictions = sortListByDateField({
      list: activeConvictions,
      dateKey: 'sentenceExpiryDate',
      newestFirst: true,
      undefinedValuesLast: true,
    })
  }
  return {
    ...caseSummary,
    convictions: {
      active: activeConvictions,
      activeCustodial: activeCustodialConvictions,
      hasMultipleActiveCustodial: activeCustodialConvictions.length > 1,
    },
    standardLicenceConditions: formOptions.standardLicenceConditions,
  }
}
