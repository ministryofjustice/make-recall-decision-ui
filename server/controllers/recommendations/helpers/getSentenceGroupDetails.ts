import sentenceGroupDetails, { SentenceGroup } from '../sentenceInformation/formOptions'

const getSentenceGroupDetailsFromEnum = (sentenceGroup: SentenceGroup) =>
  sentenceGroupDetails.find(val => val.value === sentenceGroup)

export default getSentenceGroupDetailsFromEnum
