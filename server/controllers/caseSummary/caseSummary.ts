import { Request, Response } from 'express'
import { isCaseRestrictedOrExcluded, isPreprodOrProd, isString, validateCrn } from '../../utils/utils'
import { CaseSectionId } from '../../@types'
import { getCaseSection } from './getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { AuditService } from '../../services/auditService'
import { AppError } from '../../AppError'

const auditService = new AuditService()

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  if (!isString(sectionId)) {
    throw new AppError('Invalid section ID', { status: 404 })
  }
  const normalizedCrn = validateCrn(crn)
  const { errors, ...caseSection } = await getCaseSection(
    sectionId as CaseSectionId,
    normalizedCrn,
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
    crn: normalizedCrn,
    ...caseSection,
  }
  res.locals.pageUrlBase = `/cases/${normalizedCrn}/`
  const page = isCaseRestrictedOrExcluded(caseSection.caseSummary.userAccessResponse)
    ? 'pages/excludedRestrictedCrn'
    : 'pages/caseSummary'
  res.render(page)
  auditService.caseSummaryView({
    crn: normalizedCrn,
    sectionId,
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env),
  })
}
