import jwtDecode from 'jwt-decode'
import { RequestHandler } from 'express'

import logger from '../../logger'

export enum HMPPS_AUTH_ROLE {
  SPO = 'ROLE_MAKE_RECALL_DECISION_SPO',
  PO = 'ROLE_MAKE_RECALL_DECISION',
}

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (res.locals && res.locals.user && res.locals.user.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }
      res.locals.user.roles = roles
      res.locals.user.hasSpoRole = roles.includes(HMPPS_AUTH_ROLE.SPO)
      if (res.locals.env === 'PRE-PRODUCTION') {
        logger.info(`User roles: ${JSON.stringify(roles)} for path: ${req.path}`)
      }
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}
