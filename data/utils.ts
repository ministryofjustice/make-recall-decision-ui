import { fakerEN_GB as faker } from '@faker-js/faker'

export type CriteriaDefinition<T extends Record<string, unknown>, P> = {
  key: keyof T
  generate: SupportedDefaultType | (() => P)
}

type SupportedDefaultType = 'boolean' | 'number' | 'string'

export function randomiseCriteria<T extends Record<string, unknown>>(
  definitions: Array<CriteriaDefinition<T, unknown>>,
  criteria: (t: T) => boolean
): T {
  const resultMap: Map<keyof T, unknown> = new Map()
  definitions.map(d => resultMap.set(d.key, resolveData(d.generate)))
  const result = Object.fromEntries(resultMap) as T

  return !criteria(result) ? randomiseCriteria(definitions, criteria) : result
}

function resolveData<P>(generate: SupportedDefaultType | (() => P)) {
  switch (generate) {
    case 'boolean':
      return faker.datatype.boolean()
    case 'number':
      return faker.number.int()
    case 'string':
      return faker.string.alpha()
    default:
      return generate()
  }
}
