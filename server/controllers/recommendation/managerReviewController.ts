import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'managerReview',
    },
  }

  res.render(`pages/recommendations/managerReview`)
  next()
}

export default { get }
