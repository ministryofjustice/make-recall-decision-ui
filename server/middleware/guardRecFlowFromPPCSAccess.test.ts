import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'
import { guardRecFlowFromPPCSAccess } from './guardRecFlowFromPPCSAccess'

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

function createResWithToken({ authorities }: { authorities: string[] }): Response {
  return {
    locals: {
      flags: {
        flagProbationAdmin: 'true',
      },
      user: {
        token: createToken(authorities),
      },
    },
    redirect: (redirectUrl: string) => {
      return redirectUrl
    },
  } as unknown as Response
}

describe('guardRecFlowFromPPCSAccess', () => {
  it('blocks PPCS access to rec flow', () => {
    let req: Request
    const next = jest.fn()
    const res = createResWithToken({ authorities: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    const response = guardRecFlowFromPPCSAccess(req, res, next)
    expect(response).toEqual('/inappropriate-error')
  })
  it('allows PP access to rec flow', () => {
    let req: Request
    const next = jest.fn()
    const res = createResWithToken({ authorities: ['ROLE_MAKE_RECALL_DECISION'] })
    const response = guardRecFlowFromPPCSAccess(req, res, next)
    expect(response).not.toEqual('/inappropriate-error')
  })
  it('allows SPO access to rec flow', () => {
    let req: Request
    const next = jest.fn()
    const res = createResWithToken({ authorities: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
    const response = guardRecFlowFromPPCSAccess(req, res, next)
    expect(response).not.toEqual('/inappropriate-error')
  })
})
