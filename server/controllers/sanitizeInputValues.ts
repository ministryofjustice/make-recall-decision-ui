import { NextFunction, Request, Response } from 'express'
import { stripHtmlTags } from '../utils/utils'

function sanitizeStrings(input: unknown) {
  if (typeof input === 'string') {
    return stripHtmlTags(input)
  }
}

export default function sanitizeInputValues(req: Request, res: Response, next: NextFunction) {
  walk(req.params, sanitizeStrings)
  walk(req.query, sanitizeStrings)
  walk(req.body, sanitizeStrings)
  next()
}

function walk(input: unknown, apply: (input: unknown) => unknown): unknown {
  if (Array.isArray(input)) {
    const array = input
    array.forEach(function (val, index) {
      array[index] = walk(val, apply)
    })
    return input
  }

  if (input.constructor === Object) {
    const dict = input
    Object.entries(dict).forEach(([key, value]) => {
      dict[key] = walk(value, apply)
    })
    return input
  }

  return apply(input)
}
