import { InputDisplayValuesArgs } from '../../../@types/pagesForms'
import { isDefined } from '../../../utils/utils'
import { SentenceGroup } from './formOptions'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

const inputDisplayValuesSentenceInformation = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined as SentenceGroup,
  }

  if (!isDefined(errors.sentenceGroup)) {
    inputDisplayValues.value = (apiValues as RecommendationResponse).sentenceGroup
  }

  return inputDisplayValues
}

export default inputDisplayValuesSentenceInformation
