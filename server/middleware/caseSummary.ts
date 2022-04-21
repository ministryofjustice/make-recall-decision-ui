import { Request, Response } from 'express'
import { isString } from '../utils/utils'
import { getCaseDetails } from '../data/makeDecisionApiClient'

export const caseSummary = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, section } = req.params
  if (!isString(crn)) {
    return res.sendStatus(400)
  }
  res.locals.case = await getCaseDetails((crn as string).trim(), res.locals.user.token)
  res.locals.section = section
  res.locals.pageUrlBase = `/cases/${crn}/`
  res.render('pages/caseSummary')
}
