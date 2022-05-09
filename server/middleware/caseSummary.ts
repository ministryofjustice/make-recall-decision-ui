import { Request, Response } from 'express'
import { isString } from '../utils/utils'
import { getCaseDetails } from '../data/makeDecisionApiClient'
import { CaseSectionId, ObjectMap } from '../@types'

const getCaseSectionLabel = (sectionId: CaseSectionId) => {
  switch (sectionId) {
    case 'overview':
      return 'Overview'
    case 'risk':
      return 'Risk'
    case 'personal-details':
      return 'Personal details'
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

const filterIndexOffences = (offences: ObjectMap<unknown>[]) => offences.filter(offence => offence.mainOffence)

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, sectionId } = req.params
  if (!isString(crn) || !isString(sectionId)) {
    return res.sendStatus(400)
  }
  const caseDetails = await getCaseDetails((crn as string).trim(), sectionId as CaseSectionId, res.locals.user.token)
  res.locals.case = {
    ...caseDetails,
    indexOffences: caseDetails.offences ? filterIndexOffences(caseDetails.offences) : [],
  }
  res.locals.section = {
    label: getCaseSectionLabel(sectionId as CaseSectionId),
    id: sectionId,
  }
  res.locals.pageUrlBase = `/cases/${crn}/`
  res.render('pages/caseSummary')
}
