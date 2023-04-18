import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'confirmationNoRecallLetter',
    },
    recommendation,
  }

  res.render(`pages/recommendations/confirmationNoRecallLetter`)
  next()
}

export default { get }
