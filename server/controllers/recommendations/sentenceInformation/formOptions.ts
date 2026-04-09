export enum SentenceGroup {
  ADULT_SDS = 'ADULT_SDS',
  INDETERMINATE = 'INDETERMINATE',
  EXTENDED = 'EXTENDED',
  YOUTH_SDS = 'YOUTH_SDS',
}

export const sentenceGroup = [
  {
    value: SentenceGroup.ADULT_SDS,
    text: 'Adult determinate sentence',
    detailsLabel: 'Also known as ‘adult custody’',
  },
  {
    value: SentenceGroup.INDETERMINATE,
    text: 'Indeterminate',
    detailsLabel: 'Includes adult and youth indeterminate sentences',
  },
  {
    value: SentenceGroup.EXTENDED,
    text: 'Extended sentence',
  },
  {
    value: SentenceGroup.YOUTH_SDS,
    text: 'Youth determinate sentence',
    detailsLabel:
      'Select ‘Adult determinate sentence’ if {{ fullName }} has both adult and youth determinate sentences’',
  },
]

export default sentenceGroup
