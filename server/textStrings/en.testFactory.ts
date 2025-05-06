import { randomInt } from 'crypto'
import { strings } from './en'

/**
 * Returns a valid error ID taken at random from the strings.errors object
 */
export function randomErrorId() {
  const { errors } = strings
  const keys: string[] = Object.keys(errors)
  const keyIndex: number = randomInt(0, keys.length)

  return keys[keyIndex]
}
