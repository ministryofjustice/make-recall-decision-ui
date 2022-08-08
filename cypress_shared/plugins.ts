import mammoth from 'mammoth'

export const readDocX = base64 => {
  const buffer = Buffer.from(base64, 'base64')
  return mammoth.extractRawText({ buffer })
}
