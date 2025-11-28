import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  const urlInfo = res.locals.basePath
  const { crn, fullName } = req.session

  res.locals = {
    ...res.locals,
    page: {
      id: 'noSearchPpudResults',
    },
    fullName,
    crn,
    urlInfo,
  }

  res.render(`pages/recommendations/noSearchPpudResults`)
  next()
}
export default { get }
