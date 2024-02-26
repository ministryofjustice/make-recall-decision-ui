import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'apRationaleConfirmation',
    },
    nomsNumber: recommendation.personOnProbation.nomsNumber,
    crn: recommendation.crn,
    personOnProbation: recommendation.personOnProbation.name,
  }

  res.render(`pages/recommendations/apRationaleConfirmation`)
  next()
}

export default { get }
