import { CaseSummaryOverviewResponse } from '../../../@types/make-recall-decision-api'

export const transformOverview = (caseSummary: CaseSummaryOverviewResponse) => {
  return {
    ...caseSummary,
    convictions: {
      active: caseSummary.convictions.filter(conviction => conviction.active),
    },
  }
}
