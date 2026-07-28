import { Request, Response, Router } from 'express'
import { NextFunction, RequestHandler } from 'express-serve-static-core'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'
import type UserService from '../services/userService'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

export default function standardRouter(userService: UserService): Router {
  const router = Router({ mergeParams: true })
  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(userService))
  return router
}

export type RouteDefinition = {
  path: string
  method: 'get' | 'post'
  handler: (req: Request, res: Response, next?: NextFunction) => void
  roles?: {
    allow?: HMPPS_AUTH_ROLE[]
    deny?: HMPPS_AUTH_ROLE[]
  }
  additionalMiddleware?: RequestHandler[]
  afterMiddleware?: RequestHandler[]
}
