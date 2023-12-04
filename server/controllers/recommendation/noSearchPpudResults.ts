import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  const urlInfo = res.locals.basePath
  const name = req.query.fullName as string

  res.locals = {
    ...res.locals,
    page: {
      id: 'noSearchPpudResults',
    },
    name,
    urlInfo,
  }

  res.render(`pages/recommendations/noSearchPpudResults`)
  next()
}
export default { get }
