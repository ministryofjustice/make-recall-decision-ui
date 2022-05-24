import RestClient from './restClient'
import config from '../config'
import { PersonDetails } from '../@types/make-recall-decision-api/models/PersonDetails'
import { routes } from '../../api/routes'
import { CaseSectionId } from '../@types'

function restClient(token?: string): RestClient {
  return new RestClient('Make recall decision API Client', config.apis.makeRecallDecisionApi, token)
}

export const getPersonsByCrn = (crn: string, token: string): Promise<PersonDetails[]> =>
  restClient(token).get({ path: `${routes.personSearch}?crn=${crn}` }) as Promise<PersonDetails[]>

export const getCaseSummary = <T>(crn: string, sectionId: CaseSectionId, token: string): Promise<T> =>
  restClient(token).get({ path: `${routes.getCaseSummary}/${crn}/${sectionId}` }) as Promise<T>
