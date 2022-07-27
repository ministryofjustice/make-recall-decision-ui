import { CaseSummaryOverviewResponse, ConvictionResponse } from '../../../@types/make-recall-decision-api'
import { sortListByDateField } from '../../../utils/dates'

const transformConviction = (conviction: ConvictionResponse) => {
  return {
    ...conviction,
    offences: {
      main: conviction.offences.filter(offence => offence.mainOffence).map(offence => offence.description),
      additional: conviction.offences.filter(offence => !offence.mainOffence).map(offence => offence.description),
    },
  }
}

interface DecoratedConviction {
  active?: boolean
  isCustodial?: boolean
  licenceExpiryDate?: string
  sentenceExpiryDate?: string
  offences: {
    main: string[]
    additional: string[]
  }
}

export const transformOverview = (caseSummary: CaseSummaryOverviewResponse) => {
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
      activeCustodial: activeCustodialConvictions.length === 1 ? activeCustodialConvictions[0] : undefined,
      hasMultipleActiveCustodial: activeCustodialConvictions.length > 1,
    },
  }
}
