import jwtDecode from 'jwt-decode'
import type { Request, Response, NextFunction, RequestHandler } from 'express'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}
export default function asyncMiddleware(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
    res.locals.user.roles = roles
    res.locals.user.hasPpcsRole = roles.includes(HMPPS_AUTH_ROLE.PPCS)
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
