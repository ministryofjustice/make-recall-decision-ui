import { isDefined } from '../../../utils/utils'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesAddPreviousRecall = ({ errors = {} }: InputDisplayValuesArgs) => {
  if (isDefined(errors.previousRecallDate)) {
    return {
      value: errors.previousRecallDate.values,
    }
  }
  return { value: undefined }
}
