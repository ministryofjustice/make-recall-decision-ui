import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'

export const extractNomisEstablishment = (recommendation: RecommendationResponse): string => {
  return recommendation.prisonOffender?.establishment
}

export const extractPpudEstablishment = (recommendation: RecommendationResponse): string => {
  let ppudEstablishment = recommendation.ppudOffender?.establishment
  if (!ppudEstablishment) {
    ppudEstablishment = 'There is a PPUD record but this field is blank'
  }
  return ppudEstablishment
}

export const extractCurrentEstablishment = (
  recommendation: RecommendationResponse,
  validEstablishments: string[]
): string => {
  let currentEstablishment = recommendation.bookRecallToPpud?.currentEstablishment
  if (!currentEstablishment || !validEstablishments.includes(currentEstablishment)) {
    // We guard ourselves against the PPUD list changing without us knowing
    if (validEstablishments.includes('Not Specified')) {
      currentEstablishment = 'Not Specified'
    } else {
      currentEstablishment = ''
    }
  }
  return currentEstablishment
}
