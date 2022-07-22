import { FormError, ObjectMap } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse, RecallType } from '../../../@types/make-recall-decision-api'
import { radioCheckboxItems } from '../../../utils/lists'
import { formOptions } from '../formOptions'

export interface GetFormValuesArgs {
  errors: ObjectMap<FormError>
  apiValues: RecommendationResponse
}

export const getFormValues = ({ errors = {}, apiValues }: GetFormValuesArgs) => {
  const values = {} as ObjectMap<unknown>

  // radio / checkbox options
  ;['recallType'].forEach((key: string) => {
    const value = isDefined(errors[key])
      ? errors[key].values || ''
      : getProperty<RecommendationResponse, RecallType>(apiValues, key)?.value
    values[key] = radioCheckboxItems({ items: formOptions.recallType, currentValues: value as string })
  })

  return values
}
