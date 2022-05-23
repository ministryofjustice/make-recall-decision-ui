import { NextFunction, Request, Response } from 'express'

export const parseUrl = (req: Request, res: Response, next: NextFunction) => {
  res.locals.urlInfo = {
    path: req.path,
  }
  next()
}
