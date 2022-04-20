import { Request, Response } from 'express'
import { getPersonsByCrn } from '../data/makeDecisionApiClient'
import { isString } from '../utils/utils'

export const personSearchResults = async (req: Request, res: Response) => {
  const { crn } = req.query
  if (!isString(crn)) {
    return res.sendStatus(400)
  }
  res.locals.persons = await getPersonsByCrn((crn as string).trim(), res.locals.user.token)
  res.locals.crn = crn
  res.render('pages/personSearchResults')
}
