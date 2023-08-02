import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'confirmationPartA',
    },
  }

  res.render(`pages/recommendations/confirmationPartA`)
  next()
}

export default { get }
