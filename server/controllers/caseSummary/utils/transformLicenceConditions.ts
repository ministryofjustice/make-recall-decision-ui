import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'
import { sortList } from '../../../utils/lists'

export const transformLicenceConditions = (caseSummary: LicenceConditionsResponse) => {
  return {
    ...caseSummary,
    convictions: caseSummary.convictions.map(offence => {
      return {
        ...offence,
        offences: {
          main: offence.offences.filter(item => item.mainOffence === true),
          additional: offence.offences.filter(item => item.mainOffence === false),
        },
        licenceConditions: sortList(offence.licenceConditions, 'licenceConditionTypeMainCat.code', false),
      }
    }),
  }
}
