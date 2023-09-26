import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'previewPartA',
    },
  }

  res.render(`pages/recommendations/previewPartA`)
  next()
}

export default { get }
