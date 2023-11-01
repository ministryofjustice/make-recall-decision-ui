import { Request, Response } from 'express'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { AuditService } from '../../services/auditService'
import { isPreprodOrProd } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { PersonDetailsResponse } from '../../@types/make-recall-decision-api'
import { formatDateTimeFromIsoString } from '../../utils/dates/format'

const auditService = new AuditService()
export const personSearchInPpud = async (req: Request, res: Response) => {
  const { hasPpcsRole, crn } = {
    hasPpcsRole: req.query.hasPpcsRole as string,
    crn: req.query.crn as string,
  }
  const caseSummary = await getCaseSummary<PersonDetailsResponse>(crn, 'personal-details', res.locals.user.token)
  const { user, flags } = res.locals
  res.locals.hasPpcsRole = hasPpcsRole
  res.locals.croNumber = caseSummary.personalDetailsOverview.croNumber
  res.locals.nomsNumber = caseSummary.personalDetailsOverview.nomsNumber
  res.locals.dateOfBirth = formatDateTimeFromIsoString({ isoDate: caseSummary.personalDetailsOverview.dateOfBirth })
  res.locals.crn = crn
  res.locals.fullName = caseSummary.personalDetailsOverview.fullName
  res.render('pages/personSearchInPpudResults')

  appInsightsEvent(EVENTS.PERSON_SEARCH_RESULTS, user.username, { crn, region: user.region }, flags)
  auditService.personSearch({
    searchTerm: { crn },
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env),
  })
}
