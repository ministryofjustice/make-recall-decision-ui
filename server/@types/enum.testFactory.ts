import { randomInt } from 'crypto'

/**
 * Returns a random enum value from the given enum
 */
export function randomEnum<EnumType>(enumType: EnumType): EnumType[keyof EnumType] {
  const enumKeys: Array<keyof EnumType> = Object.keys(enumType) as Array<keyof EnumType>

  const randomIndex: number = randomInt(0, enumKeys.length)
  const randomKey: keyof EnumType = enumKeys[randomIndex]

  return enumType[randomKey]
}
