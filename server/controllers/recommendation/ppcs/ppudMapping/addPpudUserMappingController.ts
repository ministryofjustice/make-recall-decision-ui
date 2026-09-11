import { NextFunction, Request, Response } from 'express'
import { createPpudUserMapping } from '../../../../data/makeDecisionApiClient'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'
import validatePpudUserMapping from './ppudUserMappingValidator'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'addPpudUserMapping',
    },
    action: 'Add',
  }
  res.render(`pages/recommendations/ppcs/ppudUserMapping/editPpudUserMapping`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { userName, ppudUserFullName, ppudTeamName, ppudUserName } = req.body
  const editedMapping = { userName, ppudUserFullName, ppudTeamName, ppudUserName }

  const errors = await validatePpudUserMapping(editedMapping, res.locals.user.token)

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, `${ppcsPaths.ppudUserMappings}/add`)
  }

  await createPpudUserMapping(
    {
      userName,
      ppudUserFullName,
      ppudTeamName,
      ppudUserName,
    },
    res.locals.user.token,
  )

  return res.redirect(303, ppcsPaths.ppudUserMappings)
}

export default { get, post }
