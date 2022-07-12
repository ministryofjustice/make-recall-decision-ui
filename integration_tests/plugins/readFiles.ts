import pdf from 'pdf-parse'
import fs from 'fs'
import mammoth from 'mammoth'

export const readPdf = downloadPath => {
  const dataBuffer = fs.readFileSync(downloadPath)
  return pdf(dataBuffer).then(data => {
    return data.text
  })
}

export const readBase64File = downloadPath => {
  return fs.readFileSync(downloadPath, { encoding: 'base64' })
}

export const readDocX = downloadPath => {
  return mammoth.extractRawText({ path: downloadPath })
}
