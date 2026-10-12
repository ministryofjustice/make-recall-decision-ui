import { NextFunction, Request, Response } from 'express'
import renderStrings from './recommendations/helpers/renderStrings'
import type { StringsDefinition } from '../@types/strings'
import renderErrorMessages from '../utils/renderErrorMessages'
import { renderFormOptions } from './recommendations/formOptions/formOptions'
import { FormOption } from '../@types/FormOptions'

const customizeMessagesWith =
  (strings: StringsDefinition, moduleFormOptions: Record<string, FormOption[]>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { recommendation } = res.locals

    const stringRenderParams = {
      fullName: recommendation?.personOnProbation?.name,
    }

    res.locals = {
      ...res.locals,
      pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
      pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
      taskListLinkTexts: renderStrings(strings.taskListLinkTexts, stringRenderParams),
      errors: renderErrorMessages(res.locals.errors, stringRenderParams),
      formOptions: renderFormOptions(stringRenderParams, moduleFormOptions),
    }
    next()
  }

export default customizeMessagesWith
