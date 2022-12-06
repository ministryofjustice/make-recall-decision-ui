import { InputDisplayValuesArgs } from '../../../@types'
import { isDefined } from '../../../utils/utils'
import { splitIsoDateToParts } from '../../../utils/dates/convert'

export const inputDisplayValuesAddPreviousRelease = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (isDefined(errors.previousReleaseDate)) {
    return {
      value: errors.previousReleaseDate.values,
    }
  }
  return {
    value: splitIsoDateToParts(apiValues.previousReleases?.previousReleaseDates?.[0]),
  }
}
