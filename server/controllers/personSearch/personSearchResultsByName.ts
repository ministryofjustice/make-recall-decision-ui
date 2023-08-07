import { Request, Response } from 'express'
import { routeUrls } from '../../routes/routeUrls'
import { AuditService } from '../../services/auditService'
import { isEmptyStringOrWhitespace, isInvalidName, isPreprodOrProd } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { searchPersons } from '../../data/makeDecisionApiClient'

const auditService = new AuditService()

export const personSearchResultsByName = async (req: Request, res: Response) => {
  const { lastName, firstName, page } = {
    lastName: req.query.lastName as string,
    firstName: req.query.firstName as string,
    page: req.query.page as string,
  }
  const { user, flags } = res.locals

  const errors = []
  if (isEmptyStringOrWhitespace(lastName) || isInvalidName(lastName)) {
    const errorId = 'missingLastName'
    errors.push(
      makeErrorObject({
        id: 'lastName',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (isEmptyStringOrWhitespace(firstName) || isInvalidName(firstName)) {
    const errorId = 'missingFirstName'
    errors.push(
      makeErrorObject({
        id: 'firstName',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length) {
    req.session.errors = errors
    req.session.unsavedValues = { lastName, firstName }
    return res.redirect(303, routeUrls.searchByName)
  }
  res.locals.persons = []
  res.locals.firstName = firstName
  res.locals.lastName = lastName

  res.locals.page = await searchPersons(user.token, Number(page) - 1, 20, undefined, firstName, lastName)
  res.render('pages/paginatedPersonSearchResults')
  appInsightsEvent(EVENTS.PERSON_SEARCH_RESULTS, user.username, { lastName, firstName, region: user.region }, flags)
  auditService.personSearch({
    searchTerm: { lastName, firstName },
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env),
  })
}
