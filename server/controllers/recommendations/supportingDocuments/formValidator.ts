import { SupportingDocument } from '../../../@types/make-recall-decision-api/models/SupportingDocumentsResponse'
import { NamedFormError } from '../../../@types/pagesForms'
import strings from '../../../textStrings/en'
import { makeErrorObject } from '../../../utils/errors'
import { renderTemplateString } from '../../../utils/nunjucks'

const maxFileSize = 25 * 1024 * 1024
const supportedMimeTypes = [
  'application/pdf',
  'text/plain',
  // .doc
  'application/msword',
  // .docx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // .msg (Outlook)
  'application/vnd.ms-outlook',
  // .eml
  'message/rfc822',
]

// Browsers don't recognise all file types and may send application/octet-stream instead.
// This maps extensions that are known to have this problem to their correct MIME types.
export const octetStreamMimeTypes: Record<string, string> = {
  '.msg': 'application/vnd.ms-outlook',
}

const getFileExtension = (filename: string): string => filename.slice(filename.lastIndexOf('.')).toLowerCase()

const validateFileUploadRequest = (
  file: Express.Multer.File,
  existingDocuments: SupportingDocument[],
): NamedFormError[] => {
  const errors = []

  // Validation
  if (file.size > maxFileSize) {
    const errorId = 'fileSizeExceeded'
    errors.push(
      makeErrorObject({
        id: 'file',
        text: renderTemplateString(strings.errors[errorId], { filename: file.originalname }),
        errorId,
      }),
    )
  }

  if (!file.originalname.match(/^[^"<>|:*?/\\]+.[a-zA-Z]{3,4}$/)) {
    const errorId = 'invalidFilename'
    errors.push(
      makeErrorObject({
        id: 'file',
        text: renderTemplateString(strings.errors[errorId], { filename: file.originalname }),
        errorId,
      }),
    )
  }

  const extension = getFileExtension(file.originalname)
  const isSupportedMimetype = supportedMimeTypes.includes(file.mimetype)
  const isSupportedOctetStream = file.mimetype === 'application/octet-stream' && extension in octetStreamMimeTypes

  if (!isSupportedMimetype && !isSupportedOctetStream) {
    const errorId = 'invalidFiletype'
    errors.push(
      makeErrorObject({
        id: 'file',
        text: renderTemplateString(strings.errors[errorId], { filename: file.originalname }),
        errorId,
      }),
    )
  }

  const docNames = existingDocuments.map(doc => doc.filename)

  if (docNames.includes(file.originalname)) {
    const errorId = 'duplicateFilename'
    errors.push(
      makeErrorObject({
        id: 'file',
        text: renderTemplateString(strings.errors[errorId], { filename: file.originalname }),
        errorId,
      }),
    )
  }

  return errors
}

export default validateFileUploadRequest
