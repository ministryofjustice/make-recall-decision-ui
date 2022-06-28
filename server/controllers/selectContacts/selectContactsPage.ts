import { Request, Response } from 'express'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { getValue } from '../../data/fetchFromCacheOrApi'

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
  const evidence = await getValue(`evidence:${crn}`)
  res.locals = {
    ...res.locals,
    ...caseSection,
    addedContacts: evidence?.contacts,
    isSelectContactsPage: true,
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  res.render('pages/selectContacts')
}
