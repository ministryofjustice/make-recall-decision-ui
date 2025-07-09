import { isDefined } from '../../../utils/utils'
import { splitIsoDateToParts } from '../../../utils/dates/conversion'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesDecisionDateTime = ({ errors, unsavedValues, apiValues }: InputDisplayValuesArgs) => {
  if (isDefined(errors)) {
    return {
      dateTime: {
        values: unsavedValues?.dateTime,
        invalidParts: errors.dateTime?.invalidParts,
      },
    }
  }

  return {
    dateTime: {
      values: splitIsoDateToParts(apiValues?.decisionDateTime),
    },
  }
}
