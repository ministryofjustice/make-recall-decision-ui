import { randomInt } from 'crypto'

/**
 * Returns a random enum value from the given enum, excluding the values provided
 */
export function randomEnum<EnumType>(
  enumType: EnumType,
  excludedValues: EnumType[keyof EnumType][] = []
): EnumType[keyof EnumType] {
  const enumValues: Array<EnumType[keyof EnumType]> = Object.values(enumType) as Array<EnumType[keyof EnumType]>
  if (excludedValues.length > 0) {
    excludedValues.forEach(itemToExclude => {
      const itemIndex = enumValues.indexOf(itemToExclude)
      enumValues.splice(itemIndex, 1)
    })
  }

  const randomIndex: number = randomInt(0, enumValues.length)
  return enumValues[randomIndex]
}
