import { Response } from 'superagent'
import RestClient from './restClient'
import config from '../config'
import { routes } from '../../api/routes'

import {
  ActiveRecommendation,
  CreateRecommendationRequest,
  DocumentResponse,
  PersonDetails,
  RecommendationResponse,
} from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { CaseSectionId } from '../@types/pagesForms'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { PpcsSearchResponse } from '../@types/make-recall-decision-api/models/PpcsSearchResponse'
import { PpudSearchResponse } from '../@types/make-recall-decision-api/models/ppudSearchResponse'
import { PrisonOffenderSearchResponse } from '../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'
import { PrisonSentence } from '../@types/make-recall-decision-api/models/PrisonSentence'
import { PpudReferenceListResponse } from '../@types/make-recall-decision-api/models/PpudReferenceListResponse'
import { PpudDetailsResponse } from '../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { PpudCreateOffenderResponse } from '../@types/make-recall-decision-api/models/PpudCreateOffenderResponse'
import { PpudCreateOffenderRequest } from '../@types/make-recall-decision-api/models/PpudCreateOffenderRequest'
import { SupportingDocument } from '../@types/make-recall-decision-api/models/SupportingDocumentsResponse'
import { PpudUpdateSentenceRequest } from '../@types/make-recall-decision-api/models/PpudUpdateSentenceRequest'
import { PpudUpdateOffenceRequest } from '../@types/make-recall-decision-api/models/PpudUpdateOffenceRequest'
import { PpudUpdateReleaseRequest } from '../@types/make-recall-decision-api/models/PpudUpdateReleaseRequest'
import { PpudCreateRecallRequest } from '../@types/make-recall-decision-api/models/PpudCreateRecallRequest'
import { PpudCreateRecallResponse } from '../@types/make-recall-decision-api/models/PpudCreateRecallResponse'
import { PpudUpdateReleaseResponse } from '../@types/make-recall-decision-api/models/PpudUpdateReleaseResponse'
import { PpudUpdateOffenderRequest } from '../@types/make-recall-decision-api/models/PpudUpdateOffenderRequest'
import { PpudCreateSentenceResponse } from '../@types/make-recall-decision-api/models/PpudCreateSentenceResponse'
import { SupportingDocumentResponse } from '../@types/make-recall-decision-api/models/SupportingDocumentResponse'

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

  if (!nomsId) {
    return
  }

  body.nomsId = nomsId
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

export const prisonSentences = async (token: string, nomsId: string): Promise<PrisonSentence[]> => {
  const body: Record<string, unknown> = {}
  if (nomsId) {
    body.nomsId = nomsId
  }

  try {
    return (await restClient(token).post({
      path: `${routes.prisonSentences}`,
      data: body,
    })) as Promise<PrisonSentence[]>
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

export const ppudDetails = (token: string, id: string): Promise<PpudDetailsResponse> => {
  return restClient(token).post({
    path: `${routes.ppudDetails}${id}`,
  }) as Promise<PpudDetailsResponse>
}

export const ppudCreateOffender = (
  token: string,
  body: PpudCreateOffenderRequest
): Promise<PpudCreateOffenderResponse> => {
  return restClient(token).post({
    path: `/ppud/offender`,
    data: body,
  }) as Promise<PpudCreateOffenderResponse>
}

export const ppudUpdateOffender = (
  token: string,
  offenderId: string,
  body: PpudUpdateOffenderRequest
): Promise<void> => {
  return restClient(token).put({
    path: `/ppud/offender/${offenderId}`,
    data: body,
  }) as Promise<void>
}

export const ppudCreateSentence = (
  token: string,
  offenderId: string,
  body: PpudUpdateSentenceRequest
): Promise<PpudCreateSentenceResponse> => {
  return restClient(token).post({
    path: `/ppud/offender/${offenderId}/sentence`,
    data: body,
  }) as Promise<PpudCreateSentenceResponse>
}

export const ppudUpdateSentence = (
  token: string,
  offenderId: string,
  sentenceId: string,
  body: PpudUpdateSentenceRequest
): Promise<void> => {
  return restClient(token).put({
    path: `/ppud/offender/${offenderId}/sentence/${sentenceId}`,
    data: body,
  }) as Promise<void>
}

export const ppudUpdateOffence = (
  token: string,
  offenderId: string,
  sentenceId: string,
  body: PpudUpdateOffenceRequest
): Promise<void> => {
  return restClient(token).put({
    path: `/ppud/offender/${offenderId}/sentence/${sentenceId}/offence`,
    data: body,
  }) as Promise<void>
}

export const ppudUpdateRelease = (
  token: string,
  offenderId: string,
  sentenceId: string,
  body: PpudUpdateReleaseRequest
): Promise<PpudUpdateReleaseResponse> => {
  return restClient(token).post({
    path: `/ppud/offender/${offenderId}/sentence/${sentenceId}/release`,
    data: body,
  }) as Promise<PpudUpdateReleaseResponse>
}

export const ppudCreateRecall = (
  token: string,
  offenderId: string,
  releaseId: string,
  body: PpudCreateRecallRequest
): Promise<PpudCreateRecallResponse> => {
  return restClient(token).post({
    path: `/ppud/offender/${offenderId}/release/${releaseId}/recall`,
    data: body,
  }) as Promise<PpudCreateRecallResponse>
}

export const ppudReferenceList = (token: string, name: string): Promise<PpudReferenceListResponse> => {
  return restClient(token).post({
    path: `/ppud/reference/${name}`,
  }) as Promise<PpudReferenceListResponse>
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

export async function getActiveRecommendation(crn: string, token: string, featureFlags?: FeatureFlags) {
  return (await restClient(token).get({
    path: `${routes.getCaseSummary}/${crn}/active`,
    headers: featureFlagHeaders(featureFlags),
  })) as ActiveRecommendation
}

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

export const getSupportingDocuments = ({
  recommendationId,
  token,
  featureFlags,
}: {
  recommendationId: string
  token: string
  featureFlags?: FeatureFlags
}): Promise<SupportingDocument[]> => {
  return restClient(token).get({
    path: `${routes.recommendations}/${recommendationId}/documents`,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<SupportingDocument[]>
}

export const uploadSupportingDocument = ({
  recommendationId,
  token,
  filename,
  type,
  mimetype,
  data,
  featureFlags,
}: {
  recommendationId: string
  token: string
  filename: string
  type: string
  mimetype: string
  data: string
  featureFlags?: FeatureFlags
}): Promise<SupportingDocument[]> => {
  return restClient(token).post({
    path: `${routes.recommendations}/${recommendationId}/documents`,
    data: { filename, type, mimetype, data },
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<SupportingDocument[]>
}

export const downloadSupportingDocument = ({
  recommendationId,
  token,
  id,
  featureFlags,
}: {
  recommendationId: string
  token: string
  id: string
  featureFlags?: FeatureFlags
}): Promise<SupportingDocumentResponse> => {
  return restClient(token).get({
    path: `${routes.recommendations}/${recommendationId}/documents/${id}`,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<SupportingDocumentResponse>
}

export const replaceSupportingDocument = ({
  recommendationId,
  id,
  token,
  filename,
  mimetype,
  data,
  featureFlags,
}: {
  recommendationId: string
  id: string
  token: string
  filename: string
  mimetype: string
  data: string
  featureFlags?: FeatureFlags
}): Promise<SupportingDocument[]> => {
  return restClient(token).patch({
    path: `${routes.recommendations}/${recommendationId}/documents/${id}`,
    data: { filename, mimetype, data },
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<SupportingDocument[]>
}

export const deleteSupportingDocument = ({
  recommendationId,
  id,
  token,
  featureFlags,
}: {
  recommendationId: string
  id: string
  token: string
  featureFlags?: FeatureFlags
}): Promise<SupportingDocument[]> => {
  return restClient(token).delete({
    path: `${routes.recommendations}/${recommendationId}/documents/${id}`,
    headers: featureFlagHeaders(featureFlags),
  }) as Promise<SupportingDocument[]>
}
