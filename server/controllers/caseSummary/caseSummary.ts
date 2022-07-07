import { Request, Response } from 'express'
import { isCaseRestrictedOrExcluded, isString } from '../../utils/utils'
import { CaseSectionId } from '../../@types'
import { getCaseSection } from './getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { AuditService } from '../../services/auditService'

const auditService = new AuditService()

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
    res.locals.user.userId,
    req.query,
    res.locals.flags
  )
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
  }
  res.locals = {
    ...res.locals,
    crn: crnFormatted,
    ...caseSection,
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  const page = isCaseRestrictedOrExcluded(caseSection.caseSummary.userAccessResponse)
    ? 'pages/excludedRestrictedCrn'
    : 'pages/caseSummary'
  res.render(page)
  auditService.caseSummaryView({ crn: crnFormatted, sectionId, username: res.locals.user.username })
}
