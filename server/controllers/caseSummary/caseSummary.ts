import { Request, Response } from 'express'
import { isString } from '../../utils/utils'
import { CaseSectionId } from '../../@types'
import { getCaseSection } from './utils/getCaseSection'
import { transformErrorMessages } from '../../utils/errors'

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  if (!isString(crn) || !isString(sectionId)) {
    return res.sendStatus(400)
  }
  const crnFormatted = (crn as string).toUpperCase()
  const { errors, ...caseSection } = await getCaseSection(
    sectionId as CaseSectionId,
    crnFormatted,
    res.locals.user.token,
    req.query
  )
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
  }
  res.locals = {
    ...res.locals,
    ...caseSection,
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  const page = sectionId === 'contact-history-data' ? 'pages/contactHistoryData' : 'pages/caseSummary'
  res.render(page)
}
