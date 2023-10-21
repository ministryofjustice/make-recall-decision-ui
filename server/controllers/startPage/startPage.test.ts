import type { Response } from 'express'
import jwt from 'jsonwebtoken'
import { mockReq } from '../../middleware/testutils/mockRequestUtils'
import { startPage } from './startPage'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}
function createResWithToken(
  { authorities }: { authorities: string[] },
  { currentPageId }: { currentPageId: string }
): Response {
  return {
    token: createToken(authorities),
    locals: {
      flags: {
        flagProbationAdmin: 'true',
      },
      user: {
        token: createToken(authorities),
      },
      urlInfo: currentPageId,
    },
    render: jest.fn(),
  } as unknown as Response
}

describe('startPage', () => {
  it('normal operation', async () => {
    const res = createResWithToken({ authorities: ['ROLE_MAKE_RECALL_DECISION'] }, { currentPageId: 'startPage' })
    await startPage(mockReq(), res)
    expect(res.locals.searchEndpoint).toEqual('/search-by-name')
    expect(res.render).toHaveBeenCalledWith('pages/startPage')
  })
  it('with PPCS role', async () => {
    const res = createResWithToken({ authorities: ['ROLE_MARD_PPCS'] }, { currentPageId: 'startPage' })
    await startPage(mockReq(), res)
    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
    expect(res.locals.findRecallRequest).toEqual('/find-a-recall-request')
  })
})
