import { faker } from '@faker-js/faker'
import { AnyNoneOrOption, IncludeNoneOrOption } from './dataGenerators'

export function resolveAnyNoneOrOption<T>(anyNoneOrOption: AnyNoneOrOption<T>, allOptions: T[]) {
  switch (anyNoneOrOption) {
    case 'any':
      return faker.helpers.arrayElement(allOptions)
    case 'none':
      return undefined
    default:
      return anyNoneOrOption
  }
}

export function resolveIncludeNoneOrOption<T>(includeNoneOrOption: IncludeNoneOrOption<T>, include: () => T) {
  switch (includeNoneOrOption) {
    case 'include':
      return include()
    case 'none':
      return undefined
    default:
      return includeNoneOrOption
  }
}
