import { randomInt } from 'crypto'

/**
 * Generate a random boolean value.
 */
function randomBoolean() {
  return !randomInt(0, 2)
}

export default randomBoolean
