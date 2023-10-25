import { NextFunction, Request, Response } from 'express'
import jwtDecode from 'jwt-decode'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

export function guardRecFlowFromPPCSAccess(req: Request, res: Response, next: NextFunction) {
  if (res.locals && res.locals.user && res.locals.user.token) {
    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
    res.locals.user.roles = roles
    res.locals.user.hasPpcsRole = roles.includes(HMPPS_AUTH_ROLE.PPCS)
    if (res.locals.user.hasPpcsRole) {
      return res.redirect('/inappropriate-error')
    }
  }
  return next()
}
