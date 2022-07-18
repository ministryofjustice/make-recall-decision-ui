import { Response } from 'superagent'
import RestClient from './restClient'
import config from '../config'
import { PersonDetails } from '../@types/make-recall-decision-api/models/PersonDetails'
import { routes } from '../../api/routes'
import { CaseSectionId } from '../@types'
import { CreateRecommendationResponse } from '../@types/make-recall-decision-api/models/CreateRecommendationResponse'
import { RecommendationRequest, RecommendationResponse } from '../@types/make-recall-decision-api'

function restClient(token?: string): RestClient {
  return new RestClient('Make recall decision API Client', config.apis.makeRecallDecisionApi, token)
}

export const getPersonsByCrn = (crn: string, token: string): Promise<PersonDetails[]> =>
  restClient(token).get({ path: `${routes.personSearch}?crn=${crn}` }) as Promise<PersonDetails[]>

export const getCaseSummary = <T>(crn: string, sectionId: CaseSectionId, token: string): Promise<T> =>
  restClient(token).get({ path: `${routes.getCaseSummary}/${crn}/${sectionId}` }) as Promise<T>

export const createRecommendation = (crn: string, token: string): Promise<CreateRecommendationResponse> =>
  restClient(token).post({ path: routes.recommendations, data: { crn } }) as Promise<CreateRecommendationResponse>

export const getRecommendation = (recommendationId: string, token: string): Promise<RecommendationResponse> =>
  restClient(token).get({ path: `${routes.recommendations}/${recommendationId}` }) as Promise<RecommendationResponse>

export const updateRecommendation = (
  recommendationId: string,
  updatedFields: RecommendationRequest,
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
