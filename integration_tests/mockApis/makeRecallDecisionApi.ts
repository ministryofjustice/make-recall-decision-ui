import { routes } from '../../api/routes'
import { stubFor } from './wiremock'
import { CaseSectionId, ObjectMap } from '../../server/@types'

const mockGet = ({
  urlPathPattern,
  queryParams,
  statusCode = 200,
  response,
}: {
  urlPathPattern: string
  queryParams?: ObjectMap<unknown>
  statusCode: number
  response: unknown
}) =>
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

export const getCase = ({ sectionId, statusCode, response }: { sectionId: CaseSectionId; statusCode; response }) =>
  mockGet({
    urlPathPattern: `${routes.getCaseSummary}/(.*)/${sectionId}`,
    statusCode,
    response,
  })

export const getHealthCheck = () =>
  mockGet({
    urlPathPattern: routes.healthCheck,
    statusCode: 200,
    response: { status: 'UP' },
  })

export const getDownloadDocument = ({ contents, fileName }) =>
  mockGet({
    urlPathPattern: `${routes.getCaseSummary}/(.*)/documents/(.*)`,
    statusCode: 200,
    response: {
      contents,
      fileName,
    },
  })
