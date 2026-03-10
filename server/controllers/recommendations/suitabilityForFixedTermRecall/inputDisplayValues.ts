import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { booleanToYesNo } from '../../../utils/utils'

type SuitabilityFormOptions = {
  label: string
  hint?: string
}

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export default (
  // This tells typescript that the formOption keys (eg. isSentence48MonthsOrOver) will exist on formOptions
  // but will also exist on RecommendationResponse - just saying it's a key of RecommendationResponse makes the
  // booleanToYesNo function throw a warning because it thinks it can be *any* key (and RecommendationResponse has a lot)
  formOptions: Partial<Record<BooleanKeys<RecommendationResponse>, SuitabilityFormOptions>>,
  unsavedValues: Record<string, string>,
  recommendation: RecommendationResponse,
) => {
  type OptionKey = keyof typeof formOptions

  return (Object.keys(formOptions) as OptionKey[]).reduce(
    (acc, optionKey) => {
      return {
        ...acc,
        [optionKey]: {
          ...formOptions[optionKey],
          value: unsavedValues?.[optionKey] ?? booleanToYesNo(recommendation[optionKey]),
        },
      }
    },
    {} as Record<OptionKey, { label: string; hint?: string; value: string }>,
  )
}
