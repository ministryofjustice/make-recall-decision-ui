import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'
import { sortList } from '../../../utils/lists'

export const sortLicenceConditions = (caseSummary: LicenceConditionsResponse) => {
  return {
    ...caseSummary,
    offences: caseSummary.offences.map(offence => {
      return {
        ...offence,
        licenceConditions: sortList(offence.licenceConditions, 'licenceConditionTypeMainCat.code', false),
      }
    }),
  }
}
