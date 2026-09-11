import { NextFunction, Request, Response } from 'express'
import { deletePpudUserMappingById, getPpudUserMappingById } from '../../../../data/makeDecisionApiClient'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'deletePpudUserMapping',
    },
    userMapping: await getPpudUserMappingById(req.params.ppudUserMappingId, res.locals.user.token),
  }

  res.render(`pages/recommendations/ppcs/ppudUserMapping/deletePpudUserMapping`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  await deletePpudUserMappingById(req.params.ppudUserMappingId, res.locals.user.token)

  res.redirect(303, ppcsPaths.ppudUserMappings)
}

export default { get, post }
