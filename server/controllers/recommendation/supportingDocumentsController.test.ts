import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import supportingDocumentsController from './supportingDocumentsController'
import {
  getSupportingDocuments,
  uploadSupportingDocument,
  deleteSupportingDocument,
} from '../../data/makeDecisionApiClient'
import validateFileUploadRequest from '../recommendations/supportingDocuments/formValidator'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/supportingDocuments/formValidator')

const mockFile: Express.Multer.File = {
  fieldname: 'documents',
  originalname: 'samplefile.pdf',
  encoding: '',
  mimetype: '',
  size: 10,
  stream: undefined,
  destination: '',
  filename: 'samplefile.pdf',
  path: '',
  buffer: Buffer.from('mock file content'),
}

describe('get', () => {
  it('loads', async () => {
    const mockDoc = {
      title: 'Part A',
      type: '',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([mockDoc])

    const res = mockRes({
      locals: {
        user: {
          token: 'token1',
        },
      },
    })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const next = mockNext()
    await supportingDocumentsController.get(req, res, next)

    expect(getSupportingDocuments).toHaveBeenCalledWith({ recommendationId: '123', token: 'token', featureFlags: {} })
    expect(res.locals.page).toEqual({ id: 'supportingDocuments' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocuments')
    expect(res.locals.uploadedFiles).toEqual([mockDoc])
    expect(next).toHaveBeenCalled()
  })
})

describe('post request', () => {
  describe('XHR Request', () => {
    const res = mockRes({})

    beforeEach(() => {
      res.status = jest.fn().mockReturnValue(res)
      res.json = jest.fn().mockReturnValue({})
    })

    it('handles with no "action" (handles empty request)', async () => {
      const req = mockReq({
        xhr: true,
      })

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.json).toHaveBeenCalledWith({})
    })

    it('uploads a file correctly', async () => {
      const req = mockReq({
        xhr: true,
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
      })

      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([])
      ;(uploadSupportingDocument as jest.Mock).mockReturnValueOnce([])

      await supportingDocumentsController.post(req, res, mockNext())

      expect(validateFileUploadRequest).toHaveBeenCalled()
      expect(uploadSupportingDocument).toHaveBeenCalledWith({
        data: mockFile.buffer.toString('base64'),
        featureFlags: {},
        filename: 'samplefile.pdf',
        mimetype: '',
        recommendationId: '123',
        title: '',
        token: 'token',
        type: '',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(req.session.errors).toBe(undefined)
    })

    it('handles file upload client side validation errors correctly', async () => {
      const req = mockReq({
        xhr: true,
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
      })
      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([{ error: true }])

      await supportingDocumentsController.post(req, res, mockNext())

      expect(validateFileUploadRequest).toHaveBeenCalled()
      expect(uploadSupportingDocument).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: { message: '' } })
    })

    it('handles file upload server side validation errors correctly', async () => {
      const req = mockReq({
        xhr: true,
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
      })

      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([])
      ;(uploadSupportingDocument as jest.Mock).mockImplementationOnce(() => {
        throw new Error('upload failed')
      })

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false })
    })

    it('deletes a file correctly', async () => {
      const req = mockReq({
        xhr: true,
        body: {
          delete: '1234',
        },
      })

      ;(deleteSupportingDocument as jest.Mock).mockReturnValueOnce({})

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.json).toHaveBeenCalled()
    })

    it('handles delete file server side errors correctly', async () => {
      const req = mockReq({
        xhr: true,
        body: {
          delete: '1234',
        },
      })

      ;(deleteSupportingDocument as jest.Mock).mockImplementationOnce(() => {
        throw new Error('failed to delete document')
      })

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({})
    })
  })

  describe('HTTP request', () => {
    it('handles with no "action" (handles empty request)', async () => {
      const req = mockReq({
        originalUrl: '/example-url',
      })
      const res = mockRes()
      res.status = jest.fn().mockReturnValue(res)
      res.json = jest.fn()
      ;(uploadSupportingDocument as jest.Mock).mockReturnValueOnce([])

      supportingDocumentsController.post(req, res, mockNext())

      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
    })

    it('uploads a file correctly', async () => {
      const req = mockReq({
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
        originalUrl: '/example-url',
      })

      const res = mockRes()

      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([])
      ;(uploadSupportingDocument as jest.Mock).mockReturnValueOnce([])

      await supportingDocumentsController.post(req, res, mockNext())

      expect(validateFileUploadRequest).toHaveBeenCalled()
      expect(uploadSupportingDocument).toHaveBeenCalledWith({
        data: mockFile.buffer.toString('base64'),
        featureFlags: {},
        filename: 'samplefile.pdf',
        mimetype: '',
        recommendationId: '123',
        title: '',
        token: 'token',
        type: '',
      })
      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
      expect(req.session.errors).toBe(undefined)
    })

    it('handles file upload client side validation errors correctly', async () => {
      const req = mockReq({
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
        originalUrl: '/example-url',
      })
      const res = mockRes()

      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([{ error: true }])

      await supportingDocumentsController.post(req, res, mockNext())

      expect(validateFileUploadRequest).toHaveBeenCalled()
      expect(uploadSupportingDocument).not.toHaveBeenCalled()
      expect(req.session.errors).toEqual([{ error: true }])
      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
    })

    it('handles file upload server side validation errors correctly', async () => {
      const req = mockReq({
        files: [mockFile],
        params: {
          recommendationId: '123',
        },
        originalUrl: '/example-url',
      })
      const res = mockRes()

      ;(validateFileUploadRequest as jest.Mock).mockReturnValueOnce([])
      ;(uploadSupportingDocument as jest.Mock).mockImplementationOnce(() => {
        throw new Error('upload failed')
      })

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
      expect(req.session.errors).toEqual([
        {
          errorId: 'uploadFileFailure',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: 'The selected file could not be uploaded - try again',
          values: undefined,
        },
      ])
    })

    it('deletes a file correctly', async () => {
      const req = mockReq({
        body: {
          delete: '1234',
        },
        originalUrl: '/example-url',
      })
      const res = mockRes()

      ;(deleteSupportingDocument as jest.Mock).mockReturnValueOnce({})

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
      expect(req.session.errors).toBe(undefined)
    })

    it('handles delete file server side errors correctly', async () => {
      const req = mockReq({
        body: {
          delete: '1234',
        },
        originalUrl: '/example-url',
      })
      const res = mockRes()

      ;(deleteSupportingDocument as jest.Mock).mockImplementationOnce(() => {
        throw new Error('failed to delete document')
      })

      await supportingDocumentsController.post(req, res, mockNext())

      expect(res.redirect).toHaveBeenCalledWith(303, '/example-url')
      expect(req.session.errors).toEqual([
        {
          errorId: 'deleteFileFailure',
          href: '#file',
          invalidParts: undefined,
          name: 'file',
          text: 'The selected file could not be deleted - try again',
          values: undefined,
        },
      ])
    })
  })
})
