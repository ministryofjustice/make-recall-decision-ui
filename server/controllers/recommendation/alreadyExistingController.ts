import { NextFunction, Request, Response } from 'express'
import { getDateTimeInEuropeLondon } from '../../utils/dates'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'alreadyExisting',
    },
    createdDate: getDateTimeInEuropeLondon(recommendation.createdDate),
    crn: recommendation.crn,
  }

  res.render(`pages/recommendations/alreadyExisting`)
  next()
}

export default { get }
