import jwt from 'jsonwebtoken'
import { Response } from 'superagent'

import { stubFor, getRequests } from './wiremock'
import tokenVerification from './tokenVerification'

const createToken = opts => {
  const authorities = ['ROLE_MAKE_RECALL_DECISION']
  const roles = opts?.roles
  if (roles) {
    authorities.push(...opts.roles)
  }
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getRequests()
    .then(data => {
      const { requests } = data.body
      const stateParam = requests[0].request.queryParams.state
      const stateValue = stateParam ? stateParam.values[0] : requests[1].request.queryParams.state.values[0]
      return `/sign-in/callback?code=codexxxx&state=${stateValue}`
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log('Error thrown in getSignInUrl', err)
      return ''
    })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>SignIn page<h1>Sign in</h1></body></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>SignIn page<h1>Sign in</h1></body></html>',
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>Your account details</h1></body></html>',
    },
  })

const token = opts =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(opts),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const stubUser = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username: 'USER1',
        active: true,
        name: 'joe bloggs',
        authSource: 'delius',
        userId: '2500485109',
        uuid: 'a0701e84-71a6-4a20-95a7-59082cc57b00',
      },
    },
  })

const stubUserEmail = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/users/me/email',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        email: 'joe@gov.uk',
      },
    },
  })

export default {
  getSignInUrl,
  stubPing: (): Promise<[Response, Response]> => Promise.all([ping(), tokenVerification.stubPing()]),
  stubSignIn: (opts): Promise<[Response, Response, Response, Response, Response, Response]> =>
    Promise.all([favicon(), redirect(), signOut(), manageDetails(), token(opts), tokenVerification.stubVerifyToken()]),
  stubUser: (): Promise<[Response, Response]> => Promise.all([stubUser(), stubUserEmail()]),
}
