import { CustodyStatus } from '../../../@types/make-recall-decision-api/models/CustodyStatus'

export const isInCustody = (custodyStatus: CustodyStatus.selected) =>
  [CustodyStatus.selected.YES_POLICE, CustodyStatus.selected.YES_PRISON].includes(custodyStatus)
