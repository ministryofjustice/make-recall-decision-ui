import { StringsDefinition } from '../@types/strings'
import customizeMessagesWith from '../controllers/customizeMessagesWith'
import formValidationMiddleware from '../middleware/formValidationMiddleware'

import TestModule from '../pages/TestModule'
import { buildStrings } from '../textStrings/en'

// Need to move this out to somewhere where it makes sense.
const modules = [TestModule]

export function ModuleRoutes() {
  const moduleStrings = modules.reduce((acc, module) => {
    const { strings } = module
    Object.keys(strings).map((section: string): void => {
      acc[section] = { ...acc[section], ...strings[section] }
      return null
    })
    return acc
  }, {} as StringsDefinition)

  const moduleFormOptions = modules.reduce((acc, module) => {
    return { ...acc, ...module.formOptions }
  }, {})

  // Customize messages with strings from any modules we have loaded
  const customizeMessages = customizeMessagesWith(buildStrings(moduleStrings), moduleFormOptions)
  return modules.flatMap(module =>
    module.routes.map(route => ({
      ...route,
      additionalMiddleware: [
        ...(route.additionalMiddleware ?? []),
        ...(route.method === 'post' && module.autoValidate ? [formValidationMiddleware(module.formValidation)] : []),
        // Insert validation middleware here
        customizeMessages,
      ],
    })),
  )
}

export default function ModuleLoader() {
  return modules
}
