import { Request, Response } from 'express'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { getRecommendation } from './utils/persistedRecommendation'
import { standardLicenceConditions } from './refData/licenceConditions'
import { LicenceConditionsResponse } from '../../@types/make-recall-decision-api'

export const selectLicenceConditionsPage = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn } = req.params
  const crnFormatted = (crn as string).toUpperCase()
  const { errors, ...caseSection } = await getCaseSection(
    'licence-conditions',
    crnFormatted,
    res.locals.user.token,
    res.locals.user.userId,
    req.query,
    res.locals.flags
  )
  const newestActiveConviction = (caseSection.caseSummary as LicenceConditionsResponse).convictions[0]
  const recommendation = await getRecommendation(crnFormatted)
  res.locals = {
    ...res.locals,
    crn: crnFormatted,
    ...caseSection,
    licenceConditions: recommendation?.licenceConditions,
    refData: {
      standardLicenceConditions,
      additionalLicenceConditions: newestActiveConviction.licenceConditions.map(cond => ({
        id: cond.licenceConditionTypeSubCat.code,
        text: cond.licenceConditionTypeMainCat.description,
        description: cond.licenceConditionTypeSubCat.description,
      })),
    },
  }
  res.locals.pageUrlBase = `/cases/${crnFormatted}/`
  res.render('pages/recommendation/selectLicenceConditions')
}
