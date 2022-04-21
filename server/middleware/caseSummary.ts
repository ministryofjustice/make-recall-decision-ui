import { Request, Response } from 'express'
import { isString } from '../utils/utils'
import { getCaseDetails } from '../data/makeDecisionApiClient'

type SectionId = 'overview' | 'risk' | 'licence-history' | 'licence-conditions' | 'contact-log'

const getCaseSectionLabel = (sectionId: SectionId) => {
  switch (sectionId) {
    case 'overview':
      return 'Overview'
    case 'risk':
      return 'Risk'
    case 'licence-history':
      return 'Licence history'
    case 'licence-conditions':
      return 'Licence conditions'
    case 'contact-log':
      return 'Contact log'
    default:
      throw new Error(`getCaseSectionLabel: invalid sectionId: ${sectionId}`)
  }
}

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, section } = req.params
  if (!isString(crn) || !isString(section)) {
    return res.sendStatus(400)
  }
  res.locals.case = await getCaseDetails((crn as string).trim(), res.locals.user.token)
  res.locals.section = {
    label: getCaseSectionLabel(section as SectionId),
    id: section,
  }
  res.locals.pageUrlBase = `/cases/${crn}/`
  res.render('pages/caseSummary')
}
