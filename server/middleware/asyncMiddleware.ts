import type { Request, Response, NextFunction, RequestHandler } from 'express'

export default function asyncMiddleware(fn: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      return next(err)
    }
  }
}
