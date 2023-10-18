import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: { id: 'spoSeniorManagementEndorsement' },
    inputDisplayValues: {
      errors: res.locals.errors,
      spoNoRecallRationale: recommendation.spoRecallRationale,
    },
  }

  res.render(`pages/recommendations/spoSeniorManagerEndorsement`)
  next()
}

export default { get }
