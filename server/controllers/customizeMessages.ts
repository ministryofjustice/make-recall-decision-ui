import { NextFunction, Request, Response } from 'express'
import { renderStrings } from './recommendations/helpers/renderStrings'
import { strings } from '../textStrings/en'
import { renderErrorMessages } from '../utils/errors'
import { renderFormOptions } from './recommendations/formOptions/formOptions'

export default function customizeMessages(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
    formOptions: renderFormOptions(stringRenderParams),
  }
  next()
}
