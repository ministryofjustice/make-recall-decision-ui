import { jwtDecode } from 'jwt-decode'
import { NextFunction, Request, Response } from 'express'

import logger from '../../logger'

export enum HMPPS_AUTH_ROLE {
  SPO = 'ROLE_MAKE_RECALL_DECISION_SPO',
  PO = 'ROLE_MAKE_RECALL_DECISION',
  ODM = 'ROLE_MAKE_RECALL_DECISION_ODM',
  RW = 'ROLE_MAKE_RECALL_DECISION_RW',
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

export default function authorisationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (res?.locals?.user?.token) {
    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

    res.locals.user.roles = roles
    res.locals.user.hasSpoRole = roles.includes(HMPPS_AUTH_ROLE.SPO)
    res.locals.user.hasPpcsRole = roles.includes(HMPPS_AUTH_ROLE.PPCS)

    if (res.locals.env === 'PRE-PRODUCTION') {
      logger.info(`User roles: ${JSON.stringify(roles)} for path: ${req.path}`)
    }
  } else {
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
  next()
}
