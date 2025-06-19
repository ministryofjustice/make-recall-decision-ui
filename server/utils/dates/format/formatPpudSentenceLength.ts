import { PpudSentenceLength } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'

export const formatPpudSentenceLength = (sentenceLength: PpudSentenceLength) => {
  const sentenceLengthDisplayArray: string[] = []
  pushLengthComponentDisplay(sentenceLengthDisplayArray, sentenceLength.partYears, 'year')
  pushLengthComponentDisplay(sentenceLengthDisplayArray, sentenceLength.partMonths, 'month')
  pushLengthComponentDisplay(sentenceLengthDisplayArray, sentenceLength.partDays, 'day')

  return sentenceLengthDisplayArray.join(', ')
}

function pushLengthComponentDisplay(
  sentenceLengthArray: string[],
  sentenceLengthComponent: number,
  componentDisplay: string
) {
  if (sentenceLengthComponent && sentenceLengthComponent !== 0) {
    sentenceLengthArray.push(`${sentenceLengthComponent} ${pluralise(componentDisplay, sentenceLengthComponent)}`)
  }
}

function pluralise(text: string, numericValue: number): string {
  return `${text}${numericValue > 1 ? 's' : ''}`
}
