import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import path from 'path'

import allRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import UserService from '../../services/userService'
import * as auth from '../../authentication/auth'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
  hasSpoRole: false,
}

class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string) {
    return {
      token,
      ...user,
    }
  }
}

function appSetup(route: Router): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    res.locals = {}
    res.locals.user = user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler())

  return app
}

export default function appWithAllRoutes(): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(allRoutes(standardRouter(new MockUserService())))
}
