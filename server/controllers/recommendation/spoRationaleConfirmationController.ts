import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
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
