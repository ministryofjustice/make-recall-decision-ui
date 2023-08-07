import { routes } from '../../api/routes'
import { stubFor } from './wiremock'
import { CaseSectionId } from '../../server/@types/pagesForms'

const mockGet = ({
  urlPathPattern,
  queryParams,
  statusCode = 200,
  response,
}: {
  urlPathPattern: string
  queryParams?: Record<string, unknown>
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

const mockUpdate = ({
  urlPathPattern,
  statusCode = 200,
  response,
  method = 'POST',
}: {
  urlPathPattern: string
  statusCode: number
  response: unknown
  method?: 'POST' | 'PATCH'
}) =>
  stubFor({
    request: {
      method,
      urlPathPattern,
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

export const searchPersons = ({ statusCode, response }) =>
  stubFor({
    request: {
      method: 'POST',
      urlPath: '/paged-search',
    },
    response: {
      status: statusCode,
      jsonBody: response,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

export const getUser = ({ user, statusCode, response }: { user: string; statusCode; response }) =>
  mockGet({
    urlPathPattern: `${routes.getUser}/${user}`,
    statusCode,
    response,
  })

export const getCase = ({ sectionId, statusCode, response }: { sectionId: CaseSectionId; statusCode; response }) =>
  mockGet({
    urlPathPattern: `${routes.getCaseSummary}/(.*)/${sectionId}`,
    statusCode,
    response,
  })

export const getCaseV2 = ({ sectionId, statusCode, response }: { sectionId: CaseSectionId; statusCode; response }) =>
  mockGet({
    urlPathPattern: `${routes.getCaseSummary}/(.*)/${sectionId}/v2`,
    statusCode,
    response,
  })

export const getHealthCheck = () =>
  mockGet({
    urlPathPattern: routes.healthCheck,
    statusCode: 200,
    response: { status: 'UP' },
  })

export const getDownloadDocument = ({ contents, fileName, contentType }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${routes.getCaseSummary}/(.*)/documents/(.*)`,
    },
    response: {
      status: 200,
      base64Body: contents,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
      },
    },
  })

export const createRecommendation = ({
  statusCode,
  response,
}: {
  statusCode: number
  response?: Record<string, unknown>
}) =>
  mockUpdate({
    urlPathPattern: routes.recommendations,
    statusCode,
    response,
  })

export const getRecommendation = ({ statusCode = 200, response }: { statusCode?; response }) =>
  mockGet({
    urlPathPattern: `${routes.recommendations}/(.*)`,
    statusCode,
    response,
  })

export const updateRecommendation = ({
  statusCode = 200,
  response,
  suffix = '',
}: {
  statusCode?
  response
  suffix?
}) => {
  return mockUpdate({
    urlPathPattern: `${routes.recommendations}/([0-9]*)/${suffix}`,
    method: 'PATCH',
    statusCode,
    response,
  })
}

export const getStatuses = ({ statusCode = 200, response }: { statusCode?; response }) =>
  mockGet({
    urlPathPattern: `${routes.recommendations}/(.*)/statuses`,
    statusCode,
    response,
  })

export const updateStatuses = ({ statusCode = 200, response }: { statusCode?; response }) =>
  mockUpdate({
    urlPathPattern: `${routes.recommendations}/(.*)/status`,
    method: 'PATCH',
    statusCode,
    response,
  })

export const createPartA = ({ statusCode = 200, response }: { statusCode?; response }) =>
  mockUpdate({
    urlPathPattern: `${routes.recommendations}/(.*)/part-a`,
    statusCode,
    response,
  })

export const createNoRecallLetter = ({ statusCode = 200, response }: { statusCode?; response }) =>
  mockUpdate({
    urlPathPattern: `${routes.recommendations}/(.*)/no-recall-letter`,
    statusCode,
    response,
  })
