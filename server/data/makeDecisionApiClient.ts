import { Response } from 'superagent'
import RestClient from './restClient'
import config from '../config'
import { routes } from '../../api/routes'

import {
  CreateRecommendationRequest,
  DocumentResponse,
  RecommendationResponse,
  PersonDetails,
} from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { CaseSectionId } from '../@types/pagesForms'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { PpcsSearchResponse } from '../@types/make-recall-decision-api/models/PpcsSearchResponse'
import { PpudSearchResponse } from '../@types/make-recall-decision-api/models/ppudSearchResponse'
import { PrisonOffenderSearchResponse } from '../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'

function restClient(token?: string): RestClient {
  return new RestClient('Make recall decision API Client', config.apis.makeRecallDecisionApi, token)
}

const featureFlagHeaders = (featureFlags?: FeatureFlags) =>
  featureFlags ? { 'X-Feature-Flags': JSON.stringify(featureFlags) } : undefined

export const getPersonsByCrn = (crn: string, token: string): Promise<PersonDetails[]> =>
  restClient(token).get({ path: `${routes.personSearch}?crn=${crn}` }) as Promise<PersonDetails[]>

export const searchForPpcs = (token: string, crn: string): Promise<PpcsSearchResponse> => {
  const body: Record<string, unknown> = {}
  if (crn) {
    body.crn = crn
  }
  return restClient(token).post({
    path: `${routes.ppcsSearch}`,
    data: body,
  }) as Promise<PpcsSearchResponse>
}

export const searchForPrisonOffender = async (token: string, nomsId: string): Promise<PrisonOffenderSearchResponse> => {
  const body: Record<string, unknown> = {}
  if (nomsId) {
    body.nomsId = nomsId
  }

  try {
    return (await restClient(token).post({
      path: `${routes.prisonOffenderSearch}`,
      data: body,
    })) as Promise<PrisonOffenderSearchResponse>
  } catch (err) {
    if (err.data.status === 404) {
      return
    }
    throw err
  }
}

export const searchPpud = (
  token: string,
  croNumber: string,
  nomsId: string,
  familyName: string,
  dateOfBirth: string
): Promise<PpudSearchResponse> => {
  const body: Record<string, unknown> = {
    croNumber,
    nomsId,
    familyName,
    dateOfBirth,
  }
  return restClient(token).post({
    path: `${routes.ppudSearch}`,
    data: body,
  }) as Promise<PpudSearchResponse>
}

export const searchPersons = (
  token: string,
  page: number,
  pageSize: number,
  crn: string | undefined,
  firstName: string | undefined,
  lastName: string | undefined
): Promise<PersonDetails[]> => {
  const body: Record<string, unknown> = {}
  if (crn) {
    body.crn = crn
  }
  if (firstName) {
    body.firstName = firstName
  }
  if (lastName) {
    body.lastName = lastName
  }
  const queryString = `?page=${page}&pageSize=${pageSize}`
  return restClient(token).post({
    path: `${routes.personSearchPaged}${queryString}`,
    data: body,
  }) as Promise<PersonDetails[]>
}

export const getCaseSummary = <T>(
  crn: string,
  sectionId: CaseSectionId,
  token: string,
  featureFlags?: FeatureFlags
): Promise<T> =>
  restClient(token).get({
    path: `${routes.getCaseSummary}/${crn}/${sectionId}`,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<T>

export const getCaseSummaryV2 = <T>(
  crn: string,
  sectionId: CaseSectionId,
  token: string,
  featureFlags?: FeatureFlags
): Promise<T> =>
  restClient(token).get({
    path: `${routes.getCaseSummary}/${crn}/${sectionId}/v2`,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<T>

export const createRecommendation = (
  data: CreateRecommendationRequest,
  token: string,
  featureFlags?: FeatureFlags
): Promise<RecommendationResponse> =>
  restClient(token).post({
    path: routes.recommendations,
    data,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<RecommendationResponse>

export const getRecommendation = (recommendationId: string, token: string): Promise<RecommendationResponse> =>
  restClient(token).get({ path: `${routes.recommendations}/${recommendationId}` }) as Promise<RecommendationResponse>

export const updateRecommendation = ({
  recommendationId,
  valuesToSave,
  token,
  featureFlags,
  propertyToRefresh,
  pathSuffix,
}: {
  recommendationId: string
  valuesToSave?: Record<string, unknown>
  token: string
  featureFlags?: FeatureFlags
  propertyToRefresh?: string
  pathSuffix?: string
}): Promise<RecommendationResponse> => {
  const queryString = propertyToRefresh ? `?refreshProperty=${propertyToRefresh}` : ''
  return restClient(token).patch({
    path: `${routes.recommendations}/${recommendationId}/${pathSuffix || ''}${queryString}`,
    data: valuesToSave,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<RecommendationResponse>
}

export const getStatuses = ({
  recommendationId,
  token,
}: {
  recommendationId: string
  token: string
}): Promise<RecommendationStatusResponse[]> => {
  return restClient(token).get({
    path: `${routes.recommendations}/${recommendationId}/statuses`,
  }) as Promise<RecommendationStatusResponse[]>
}

export const updateStatuses = ({
  recommendationId,
  token,
  activate,
  deActivate,
}: {
  recommendationId: string
  token: string
  activate: string[]
  deActivate: string[]
}): Promise<RecommendationStatusResponse[]> => {
  return restClient(token).patch({
    path: `${routes.recommendations}/${recommendationId}/status`,
    data: { activate, deActivate },
  }) as Promise<RecommendationStatusResponse[]>
}

export const getDocumentContents = (crn: string, documentId: string, token: string): Promise<Response> => {
  return restClient(token).get({
    path: `${routes.getCaseSummary}/${crn}/documents/${documentId}`,
    raw: true,
    responseType: 'arraybuffer',
  }) as Promise<Response>
}

export const createDocument = (
  recommendationId: string,
  pathSuffix: string,
  data: Record<string, unknown>,
  token: string,
  featureFlags?: FeatureFlags,
  preview?: boolean
): Promise<DocumentResponse> =>
  restClient(token).post({
    path: `${routes.recommendations}/${recommendationId}/${pathSuffix}?preview=${String(preview)}`,
    data,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<DocumentResponse>
