import { getProperty, isDefined } from '../../../utils/utils'
import { splitIsoDateToParts } from '../../../utils/dates/convert'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesRecallReceived = ({ errors, unsavedValues, apiValues }: InputDisplayValuesArgs) => {
  if (isDefined(errors)) {
    return {
      dateTime: {
        values: unsavedValues?.dateTime,
        invalidParts: errors.dateTime?.invalidParts,
      },
    }
  }
  const receivedDateTime = getProperty<RecommendationResponse, string>(apiValues, 'bookRecallToPpud.receivedDateTime')
  return {
    dateTime: {
      values: splitIsoDateToParts(receivedDateTime),
    },
  }
}
