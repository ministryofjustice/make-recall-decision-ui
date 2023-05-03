import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,

    page: {
      id: 'managerDecisionConfirmation',
    },
  }
  res.render(`pages/recommendations/managerDecisionConfirmation`)
  next()
}

export default { get }
