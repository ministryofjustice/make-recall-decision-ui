import { NextFunction, Request, Response } from 'express'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.query

  res.locals = {
    ...res.locals,
    page: {
      id: 'noPpcsSearchResults',
    },
    crn,
  }

  res.render(`pages/noPpcsSearchResults`)
  next()
}

export default { get }
