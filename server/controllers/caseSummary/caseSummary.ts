import { Request, Response } from 'express'
import { isString } from '../../utils/utils'
import { CaseSectionId } from '../../@types'
import { getCaseSection } from './utils'

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  if (!isString(crn) || !isString(sectionId)) {
    return res.sendStatus(400)
  }
  const crnFormatted = (crn as string).toUpperCase()
  const caseSection = await getCaseSection(sectionId as CaseSectionId, crnFormatted, res.locals.user.token, req.query)
  res.locals = {
    ...res.locals,
    ...caseSection,
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  const page = sectionId === 'licence-history-data' ? 'pages/licenceHistoryData' : 'pages/caseSummary'
  res.render(page)
}
