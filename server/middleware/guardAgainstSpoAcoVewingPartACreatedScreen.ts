import { NextFunction, Request, Response } from 'express'
import jwtDecode from 'jwt-decode'

export enum HMPPS_AUTH_ROLE {
  SPO = 'ROLE_MAKE_RECALL_DECISION_SPO',
  PO = 'ROLE_MAKE_RECALL_DECISION',
}

export function guardAgainstSpoAcoVewingPartACreatedScreen(req: Request, res: Response, next: NextFunction) {
  const {
    urlInfo: { currentPageId },
  } = res.locals
  if (res.locals && res.locals.user && res.locals.user.token) {
    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
    res.locals.user.roles = roles
    res.locals.user.hasSpoRole = roles.includes(HMPPS_AUTH_ROLE.SPO)
    if (currentPageId === 'confirmation-part-a' && res.locals.user.hasSpoRole) {
      return res.redirect('/inappropriate-error')
    }
    return next()
  }
}
