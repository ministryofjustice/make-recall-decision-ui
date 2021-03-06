import { Request, Response } from 'express'
import { getPersonsByCrn } from '../../data/makeDecisionApiClient'
import { validatePersonSearch } from './validators/validatePersonSearch'
import { routeUrls } from '../../routes/routeUrls'
import { AuditService } from '../../services/auditService'
import { isPreprodOrProd } from '../../utils/utils'

const auditService = new AuditService()

export const personSearchResults = async (req: Request, res: Response) => {
  const { crn } = req.query
  const { errors, searchValue, unsavedValues } = validatePersonSearch(crn as string)
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, routeUrls.search)
  }
  res.locals.persons = await getPersonsByCrn(searchValue, res.locals.user.token)
  res.locals.crn = searchValue
  res.render('pages/personSearchResults')
  auditService.personSearch({
    searchTerm: searchValue,
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env),
  })
}
