import { Request, Response } from 'express'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { getRecommendation } from './utils/persistedRecommendation'

export const selectContactsPage = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn } = req.params
  const crnFormatted = (crn as string).toUpperCase()
  const { errors, ...caseSection } = await getCaseSection(
    'contact-history',
    crnFormatted,
    res.locals.user.token,
    res.locals.user.userId,
    req.query,
    res.locals.flags
  )
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
  }
  const recommendation = await getRecommendation(crn)
  res.locals = {
    ...res.locals,
    crn: crnFormatted,
    ...caseSection,
    addedContacts: recommendation?.contacts,
    isSelectContactsPage: true,
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  res.render('pages/recommendation/selectContacts')
}
