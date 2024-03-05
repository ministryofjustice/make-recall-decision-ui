import { StageEnum } from './StageEnum'

export default interface BookingMomento {
  stage: StageEnum
  offenderId?: string
  sentenceId?: string
  releaseId?: string
  failed?: boolean
  failedMessage?: string
}
