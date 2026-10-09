import { Readable } from 'stream'
import validateFileUploadRequest from './formValidator'

const mockFile: Express.Multer.File = {
  fieldname: 'documents',
  originalname: 'filename.pdf',
  encoding: '',
  mimetype: 'application/pdf',
  size: 10,
  stream: new Readable(),
  destination: '',
  filename: '',
  path: '',
  buffer: undefined,
}

describe('validateFileUploadRequest', () => {
  it('returns an empty array when there are no errors', () => {
    const result = validateFileUploadRequest(mockFile, [])

    expect(result).toEqual([])
  })

  describe('it returns an error when validation fails for:', () => {
    it('file size', () => {
      const file = { ...mockFile, size: 200000000000 }

      const result = validateFileUploadRequest(file, [])

      expect(result).toEqual([
        {
          errorId: 'fileSizeExceeded',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: "'filename.pdf' must be smaller than 25MB. Delete it and upload a smaller version",
          values: undefined,
        },
      ])
    })

    it('filename', () => {
      const file = { ...mockFile, originalname: '><>.d.&*.mdf' }

      const result = validateFileUploadRequest(file, [])

      expect(result).toEqual([
        {
          errorId: 'invalidFilename',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: 'The filename should not contain the following characters: < > : " / \\ | ? *. Delete it to upload again',
          values: undefined,
        },
      ])
    })

    it('file type', () => {
      const file = { ...mockFile, mimetype: 'image/png' }

      const result = validateFileUploadRequest(file, [])

      expect(result).toEqual([
        {
          errorId: 'invalidFiletype',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: "'filename.pdf' must be a Word, PDF or plain text (txt) file. Delete it to upload again",
          values: undefined,
        },
      ])
    })

    it('duplicate filename', () => {
      const result = validateFileUploadRequest(mockFile, [
        {
          title: '',
          type: '',
          filename: 'filename.pdf',
        },
      ])

      expect(result).toEqual([
        {
          errorId: 'duplicateFilename',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: "'filename.pdf' has already been uploaded. Delete it to continue",
          values: undefined,
        },
      ])
    })
  })
})
