import { Request, Response } from 'express'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { PersonDetailsResponse } from '../../@types/make-recall-decision-api'
import { isCaseRestrictedOrExcluded, validateCrn } from '../../utils/utils'

export const getConsiderRecall = async (req: Request, res: Response): Promise<void> => {
  const { crn } = req.params
  const {
    errors,
    user: { token },
  } = res.locals
  const normalizedCrn = validateCrn(crn)
  const caseSummary = await getCaseSummary<PersonDetailsResponse>(normalizedCrn, 'personal-details', token)
  const isRestricted = isCaseRestrictedOrExcluded(caseSummary.userAccessResponse)
  const page = isRestricted ? 'pages/excludedRestrictedCrn' : 'pages/considerRecall'
  if (!isRestricted) {
    res.locals.pageUrlBase = `/cases/${normalizedCrn}/`
    res.locals.inputDisplayValue = errors
      ? ''
      : caseSummary.activeRecommendation?.recallConsideredList?.[0]?.recallConsideredDetail
  }
  res.locals.caseSummary = caseSummary
  res.render(page)
}
