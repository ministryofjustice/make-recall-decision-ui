import { stubFor } from './wiremock'
import flags from '../support/featureFlagDefinitions'

export default function getFlags() {
  return stubFor({
    request: {
      method: 'ANY',
      urlPathPattern: '/flipt/(.*)',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        namespace: {
          key: 'consider-a-recall',
        },
        flags,
      },
    },
  })
}
