/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { PersonDetails } from './PersonDetails'
import { UserAccessResponse } from './UserAccessResponse'

export type CaseRisk = {
  userAccessResponse?: UserAccessResponse;
  personalDetailsOverview: PersonDetails
}
