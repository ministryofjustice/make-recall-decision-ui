import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'rationaleCheck',
    },
    inputDisplayValues: {
      value: undefined,
    },
  }

  res.render(`pages/recommendations/rationaleCheck`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { rationaleCheck } = req.body
  const { urlInfo } = res.locals

  if (!isDefined(rationaleCheck)) {
    const errorId = 'missingRationaleCheck'

    req.session.errors = [
      makeErrorObject({
        id: 'rationaleCheck',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }
  const nextPageId =
    rationaleCheck === 'YES' ? 'spo-task-list-consider-recall?fromPageId=rationale-check' : 'countersigning-telephone'
  res.redirect(303, `${urlInfo.basePath}${nextPageId}`)
}

export default { get, post }
