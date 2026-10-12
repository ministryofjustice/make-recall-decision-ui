import { NextFunction, Request, Response } from 'express'
import * as z from 'zod'
import { makeErrorObject } from '../utils/errors'

const postValidationMiddleware = (zodSchema: z.ZodType) => async (req: Request, res: Response, next: NextFunction) => {
  const originalInput = req.body

  try {
    const result = zodSchema.parse(req.body)
    req.body = result
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Zod Errors:
      req.session.errors = err.issues.map(zerr => {
        const errorId = `${zerr.path[0].toString()}`
        return makeErrorObject({
          id: errorId,
          text: zerr.message,
          errorId,
        })
      })

      req.session.unsavedValues = originalInput
    } else {
      // All other errors here
      console.log('OTHER ERROR', err)
    }
  }

  next()
}

export default postValidationMiddleware
