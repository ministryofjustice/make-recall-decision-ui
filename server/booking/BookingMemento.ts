import { StageEnum } from './StageEnum'

export default interface BookingMemento {
  stage: StageEnum
  offenderId?: string
  sentenceId?: string
  releaseId?: string
  recallId?: string
  failed?: boolean
  failedMessage?: string
  uploaded?: string[]
}
