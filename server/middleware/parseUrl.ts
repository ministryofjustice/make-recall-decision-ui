import { NextFunction, Request, Response } from 'express'

const parseUrl = (req: Request, res: Response, next: NextFunction) => {
  res.locals.urlInfo = {
    path: req.path,
  }
  next()
}

export default parseUrl
