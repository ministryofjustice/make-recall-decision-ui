import { NextFunction, Request, Response } from 'express'
import { getPpudUserMappingById, updatePpudUserMapping } from '../../../../data/makeDecisionApiClient'
import validatePpudUserMapping from './ppudUserMappingValidator'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'editPpudUserMapping',
    },
    action: 'Update',
    userMapping: await getPpudUserMappingById(req.params.ppudUserMappingId, res.locals.user.token),
  }

  res.render('pages/recommendations/ppcs/ppudUserMapping/editPpudUserMapping')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { userName, ppudUserFullName, ppudTeamName, ppudUserName } = req.body
  const editedMapping = { userName, ppudUserFullName, ppudTeamName, ppudUserName }

  const existingMappingId = req.params.ppudUserMappingId

  const errors = await validatePpudUserMapping({ ...editedMapping, id: existingMappingId }, res.locals.user.token)

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, `${ppcsPaths.ppudUserMappings}/${existingMappingId}/edit`)
  }

  await updatePpudUserMapping(existingMappingId, editedMapping, res.locals.user.token)

  return res.redirect(303, ppcsPaths.ppudUserMappings)
}

export default { get, post }
