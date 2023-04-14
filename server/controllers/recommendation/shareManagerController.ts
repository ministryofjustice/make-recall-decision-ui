import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    backLink: 'task-list-consider-recall',
    page: {
      id: 'shareCaseWithManager',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/`,
  }

  res.render(`pages/recommendations/shareCaseWithManager`)
  next()
}

export default { get }
