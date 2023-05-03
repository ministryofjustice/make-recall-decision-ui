import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,

    page: {
      id: 'managerViewDecision',
    },
  }
  res.render(`pages/recommendations/managerViewDecision`)
  next()
}

export default { get }
