import pdf from 'pdf-parse'
import fs from 'fs'

export const readPdf = base64 => {
  const buffer = Buffer.from(base64, 'base64')
  return pdf(buffer).catch(err => err)
}

export const readBase64File = downloadPath => {
  return fs.readFileSync(downloadPath, { encoding: 'base64' })
}
