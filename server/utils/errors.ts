import { FormError, KeyedFormErrors, NamedFormError, ObjectMap } from '../@types'

export const makeErrorObject = ({
  id,
  name,
  text,
  values,
}: {
  id: string
  name?: string
  text: string
  values?: ObjectMap<string> | string
}): NamedFormError => ({
  name: name || id,
  text,
  href: `#${id}`,
  values,
})

export const transformErrorMessages = (errors: NamedFormError[]): KeyedFormErrors => {
  const errorMap = errors.filter(Boolean).reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
    const { name, ...rest } = curr
    acc[name] = rest
    return acc
  }, {})
  return {
    list: errors,
    ...errorMap,
  } as KeyedFormErrors
}
