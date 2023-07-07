import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  res.locals = {
    ...res.locals,
    page: {
      id: 'spoRationaleConfirmation',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
    },
    recallType: recommendation.spoRecallType,
    crn: recommendation.crn,
    personOnProbation: recommendation.personOnProbation.name,
  }

  res.render(`pages/recommendations/spoRationaleConfirmation`)
  next()
}

export default { get }
