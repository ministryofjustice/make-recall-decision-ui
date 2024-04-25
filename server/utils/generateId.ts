const CHARACTERS = 'abcdefghiklmnopqrstuvwxwzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')

export default function generateId() {
  const result: string[] = []

  for (let i = 0; i < 10; i += 1) {
    result.push(CHARACTERS[Math.floor(Math.random() * 100) % CHARACTERS.length])
  }
  return result.join('')
}
