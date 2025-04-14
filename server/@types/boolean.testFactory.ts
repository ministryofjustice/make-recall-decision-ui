import { randomInt } from 'crypto'

/**
 * Generate a random boolean value.
 */
export function randomBoolean() {
  return !randomInt(0, 2)
}
