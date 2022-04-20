import { routes } from '../../api/routes'
import { stubFor } from './wiremock'

const mockGet = ({ urlPathPattern, queryParams, statusCode = 200, response }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern,
      queryParameters: queryParams,
    },
    response: {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

export const getPersonsByCrn = ({ statusCode, response }) =>
  mockGet({
    urlPathPattern: routes.personSearch,
    queryParams: {
      crn: {
        matches: '.*',
      },
    },
    statusCode,
    response,
  })
