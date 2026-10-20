import { Page } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/auth'
import { getUser } from '../../../integration_tests/mockApis/makeRecallDecisionApi'
import type { AuthStubOpts } from '../../../integration_tests/mockApis/auth'

const signIn = async (page: Page, opts: AuthStubOpts = {}) => {
  await auth.stubSignIn(opts)
  await auth.stubUser(opts)

  await getUser({
    user: opts.username ?? 'USER1',
    statusCode: 200,
    response: {
      homeArea: {
        code: 'N07',
        name: 'London',
      },
    },
  })

  await page.request.get('http://localhost:3007')
  const signInUrl = await auth.getSignInUrl()

  await page.goto(signInUrl)
}

export default {
  signIn,
}
