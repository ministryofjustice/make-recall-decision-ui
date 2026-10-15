import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

import authorisationMiddleware, { HMPPS_AUTH_ROLE } from './authorisationMiddleware'

function createToken(authorities: string[], extra: Record<string, string> = {}) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
    ...extra,
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('authorisationMiddleware', () => {
  let req: Request
  const next = jest.fn()

  function createResWithToken({
    authorities,
    userUuid,
    userId,
  }: {
    authorities: string[]
    userUuid?: string
    userId?: string
  }): Response {
    return {
      locals: {
        user: {
          token: createToken(authorities, {
            ...(userUuid && { user_uuid: userUuid }),
            ...(userId && { user_id: userId }),
          }),
        },
      },
      redirect: (redirectUrl: string) => {
        return redirectUrl
      },
    } as unknown as Response
  }

  it('should call next when no required roles', () => {
    const res = createResWithToken({ authorities: [] })

    authorisationMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('sets hasSpoRole to true if SPO role is present', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.SPO] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.hasSpoRole).toEqual(true)
  })

  it('sets hasPpcsRole to true if PPCS role is present', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.PPCS] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.hasPpcsRole).toEqual(true)
  })

  it('sets hasSpoRole to true if ODM role is present', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.ODM] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.hasOdmRole).toEqual(true)
  })

  it('should set roles', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.SPO, HMPPS_AUTH_ROLE.PO] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.roles).toEqual([HMPPS_AUTH_ROLE.SPO, HMPPS_AUTH_ROLE.PO])
  })

  it('sets hasSpoRole to false if SPO role is not present', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.PO] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.hasSpoRole).toEqual(false)
  })

  it('sets userUuid and userId from token claims', () => {
    const res = createResWithToken({
      authorities: [HMPPS_AUTH_ROLE.PO],
      userUuid: 'abc-def-123',
      userId: '12345',
    })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.userUuid).toEqual('abc-def-123')
    expect(res.locals.user.userId).toEqual('12345')
  })

  it('sets userUuid and userId to undefined when not present in token', () => {
    const res = createResWithToken({ authorities: [HMPPS_AUTH_ROLE.PO] })

    authorisationMiddleware(req, res, next)

    expect(res.locals.user.userUuid).toBeUndefined()
    expect(res.locals.user.userId).toBeUndefined()
  })
})
