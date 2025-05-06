import { getRoute } from './custodyGroupRouter'
import { CUSTODY_GROUP } from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

describe('getRoute', () => {
  it('get determinate route', async () => {
    // given when
    const actualRoute: string = getRoute(CUSTODY_GROUP.DETERMINATE)

    // then
    expect(actualRoute).toEqual('select-index-offence')
  })
  it('get indeterminate route', async () => {
    // given when
    const actualRoute: string = getRoute(CUSTODY_GROUP.INDETERMINATE)

    // then
    expect(actualRoute).toEqual('select-indeterminate-ppud-sentence')
  })
})
