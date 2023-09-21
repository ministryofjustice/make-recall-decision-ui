import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'shareCaseWithAdmin',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/task-list`,
  }

  res.render(`pages/recommendations/shareCaseWithAdmin`)
  next()
}

export default { get }
