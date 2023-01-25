import { isDefined } from '../../../utils/utils'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesAddPreviousRelease = ({ errors = {} }: InputDisplayValuesArgs) => {
  if (isDefined(errors.previousReleaseDate)) {
    return {
      value: errors.previousReleaseDate.values,
    }
  }
  return { value: undefined }
}
