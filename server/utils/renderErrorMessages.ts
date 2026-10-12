import { KeyedFormErrors, NamedFormError } from '../@types/pagesForms'
import { renderTemplateString } from './nunjucks'

const renderErrorMessages = (errors: KeyedFormErrors, locals: Record<string, unknown>): KeyedFormErrors | undefined => {
  if (!errors) {
    return undefined
  }

  return Object.entries(errors).reduce(
    (acc: Record<string, unknown>, [key, val]) => {
      if (key === 'list') {
        acc.list = (val as unknown as NamedFormError[]).map(err => {
          const { text, ...rest } = err
          return {
            ...rest,
            html: renderTemplateString(err.text, locals),
          }
        })
      } else {
        acc[key] = { ...val, text: renderTemplateString(val.text, locals) }
      }
      return acc
    },
    { list: [] },
  ) as KeyedFormErrors
}

export default renderErrorMessages
