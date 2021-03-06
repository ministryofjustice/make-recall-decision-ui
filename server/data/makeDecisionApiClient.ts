import { Response } from 'superagent'
import RestClient from './restClient'
import config from '../config'
import { PersonDetails } from '../@types/make-recall-decision-api/models/PersonDetails'
import { routes } from '../../api/routes'
import { CaseSectionId } from '../@types'
import { RecommendationResponse, UpdateRecommendationRequest } from '../@types/make-recall-decision-api'

function restClient(token?: string): RestClient {
  return new RestClient('Make recall decision API Client', config.apis.makeRecallDecisionApi, token)
}

export const getPersonsByCrn = (crn: string, token: string): Promise<PersonDetails[]> =>
  restClient(token).get({ path: `${routes.personSearch}?crn=${crn}` }) as Promise<PersonDetails[]>

export const getCaseSummary = <T>(crn: string, sectionId: CaseSectionId, token: string): Promise<T> =>
  restClient(token).get({ path: `${routes.getCaseSummary}/${crn}/${sectionId}` }) as Promise<T>

export const createRecommendation = (crn: string, token: string): Promise<RecommendationResponse> =>
  restClient(token).post({ path: routes.recommendations, data: { crn } }) as Promise<RecommendationResponse>

export const getRecommendation = (recommendationId: string, token: string): Promise<RecommendationResponse> =>
  restClient(token).get({ path: `${routes.recommendations}/${recommendationId}` }) as Promise<RecommendationResponse>

export const updateRecommendation = (
  recommendationId: string,
  updatedFields: UpdateRecommendationRequest,
  token: string
): Promise<RecommendationResponse> =>
  restClient(token).patch({
    path: `${routes.recommendations}/${recommendationId}`,
    data: updatedFields,
  }) as Promise<RecommendationResponse>

export const getDocumentContents = (crn: string, documentId: string, token: string): Promise<Response> => {
  return restClient(token).get({
    path: `${routes.getCaseSummary}/${crn}/documents/${documentId}`,
    raw: true,
    responseType: 'arraybuffer',
  }) as Promise<Response>
}
