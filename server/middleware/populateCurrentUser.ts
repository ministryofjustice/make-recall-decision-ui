import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService, { UserDetails } from '../services/userService'

interface UserSessionData {
  [key: string]: UserDetails
}

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const session = req.session as unknown as UserSessionData
        if (!session[res.locals.user.token]) {
          session[res.locals.user.token] = res.locals.user && (await userService.getUser(res.locals.user.token))
        }

        if (session[res.locals.user.token]) {
          res.locals.user = { ...session[res.locals.user.token], ...res.locals.user }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
