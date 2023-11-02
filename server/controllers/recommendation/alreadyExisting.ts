import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'alreadyExisting',
    },
    crn: recommendation.crn,
  }

  res.render(`pages/recommendations/alreadyExisting`)
  next()
}

export default { get }
