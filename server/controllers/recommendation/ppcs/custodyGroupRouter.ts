import { CUSTODY_GROUP } from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

export function getRoute(custodyGroup: CUSTODY_GROUP): string {
  switch (custodyGroup) {
    case CUSTODY_GROUP.DETERMINATE:
      return 'select-index-offence'
    case CUSTODY_GROUP.INDETERMINATE:
      return 'select-indeterminate-ppud-sentence'
    default:
      throw new Error('Unexpected custody group found')
  }
}
