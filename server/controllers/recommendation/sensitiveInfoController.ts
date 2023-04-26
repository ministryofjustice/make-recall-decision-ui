import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'sensitiveInformation',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/`,
  }

  res.render(`pages/recommendations/sensitiveInformation`)
  next()
}

export default { get }
