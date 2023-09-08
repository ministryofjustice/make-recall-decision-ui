import { Request, Response } from 'express'
import { searchPersons, getPersonsByCrn } from '../../data/makeDecisionApiClient'
import { validatePersonSearch } from './validators/validatePersonSearch'
import { routeUrls } from '../../routes/routeUrls'
import { AuditService } from '../../services/auditService'
import { isPreprodOrProd } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import config from '../../config'

const auditService = new AuditService()

export const personSearchResults = async (req: Request, res: Response) => {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { crn, page } = {
    crn: req.query.crn as string,
    page: req.query.page as string,
  }

  const { user, flags } = res.locals
  const { errors, searchValue, unsavedValues } = validatePersonSearch(crn)
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, routeUrls.searchByCRN)
  }
  res.locals.crn = searchValue
  if (flags.flagSearchByName) {
    res.locals.page = await searchPersons(user.token, Number(page) - 1, 20, searchValue, undefined, undefined)
    res.render('pages/paginatedPersonSearchResults')
  } else {
    res.locals.persons = await getPersonsByCrn(searchValue, user.token)
    res.render('pages/personSearchResults')
  }
  appInsightsEvent(EVENTS.PERSON_SEARCH_RESULTS, user.username, { crn: searchValue, region: user.region }, flags)
  auditService.personSearch({
    searchTerm: { crn: searchValue },
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env),
  })
}
