import { InputDisplayValuesArgs } from '../../../@types'
import { isDefined } from '../../../utils/utils'
import { splitIsoDateToParts } from '../../../utils/dates/convert'

export const inputDisplayValuesVictimLiaisonOfficer = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (isDefined(errors.dateVloInformed)) {
    return {
      value: errors.dateVloInformed.values,
    }
  }
  return {
    value: splitIsoDateToParts(apiValues.dateVloInformed),
  }
}
