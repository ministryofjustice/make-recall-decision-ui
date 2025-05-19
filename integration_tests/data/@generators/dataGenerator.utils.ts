import { faker } from '@faker-js/faker'
import { AnyNoneOrOption, IncludeNoneOrOption } from './dataGenerators'

export function resolveAnyNoneOrOption<T>(anyNoneOrOption: AnyNoneOrOption<T>, key: string, allOptions: T[]) {
  const build = {}
  switch (anyNoneOrOption) {
    case 'any':
      build[key] = faker.helpers.arrayElement(allOptions)
      return build
    case 'none':
      return undefined
    default:
      build[key] = anyNoneOrOption
      return build
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
