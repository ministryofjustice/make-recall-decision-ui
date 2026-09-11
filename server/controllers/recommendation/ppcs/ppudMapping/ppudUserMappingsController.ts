import { NextFunction, Request, Response } from 'express'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const userMappings = await getPpudUserMappings(res.locals.user.token)
  res.locals = {
    ...res.locals,
    page: {
      id: 'ppudUserMappings',
    },
    userMappings,
  }

  res.render(`pages/recommendations/ppcs/ppudUserMapping/ppudUserMappings`)
  next()
}

export default { get }
