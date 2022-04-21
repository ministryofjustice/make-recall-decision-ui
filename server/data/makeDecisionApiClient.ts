import RestClient from './restClient'
import config from '../config'
import { Person } from '../@types/make-recall-decision-api/models/Person'
import { routes } from '../../api/routes'
import { Case } from '../@types/make-recall-decision-api/models/Case'

function restClient(token?: string): RestClient {
  return new RestClient('Make recall decision API Client', config.apis.makeRecallDecisionApi, token)
}

export const getPersonsByCrn = (crn: string, token: string): Promise<Person[]> =>
  restClient(token).get({ path: `${routes.personSearch}?crn=${crn}` }) as Promise<Person[]>

export const getCaseDetails = (crn: string, token: string): Promise<Case> =>
  restClient(token).get({ path: `${routes.getCaseDetails}/${crn}` }) as Promise<Case>
