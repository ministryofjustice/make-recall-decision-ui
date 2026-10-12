import { NextFunction, Request, Response } from 'express'
import path from 'path'
import type { RecommendationRequestParams } from '@car-types/requestParams'
import type { FormSchema } from './forms/validator'

const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.locals.testVariable = 'Hello!'
  res.locals.page = {
    id: 'testPage',
  }

  res.locals = {
    ...res.locals,
    formValues: res.locals.unsavedValues,
  }

  res.render(path.join(__dirname, 'views/testView'))
}

const post = async (
  req: Request<RecommendationRequestParams, unknown, FormSchema>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { recommendationId } = req.params
  if (req.session.errors?.length) {
    res.redirect(303, `/recommendations/${recommendationId}/module-test`)
  }
}

export default {
  get,
  post,
}
