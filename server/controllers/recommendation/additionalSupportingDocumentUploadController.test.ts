import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getSupportingDocuments, uploadSupportingDocument } from '../../data/makeDecisionApiClient'
import additionalSupportingDocumentUploadController from './additionalSupportingDocumentUploadController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const req = mockReq()
    const res = mockRes()
    const next = mockNext()
    await additionalSupportingDocumentUploadController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'additionalSupportingDocumentUpload' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/additionalSupportingDocumentUpload')
    expect(next).toHaveBeenCalled()
  })
  it('load with error', async () => {
    const req = mockReq()

    const res = mockRes({
      locals: {
        unsavedValues: {
          title: 'a title',
        },
        errors: {
          list: [
            {
              name: 'title',
              href: '#title',
              errorId: 'title',
              html: 'Enter a document title',
            },
          ],
        },
        token: 'token1',
      },
    })

    const next = mockNext()
    await additionalSupportingDocumentUploadController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'additionalSupportingDocumentUpload' })
    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'title',
          href: '#title',
          errorId: 'title',
          html: 'Enter a document title',
        },
      ],
    })
    expect(res.locals.inputDisplayValues).toEqual({ title: 'a title' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/additionalSupportingDocumentUpload')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with file', async () => {
    const req = mockReq({
      params: {
        recommendationId: '1234',
      },
      body: {
        title: 'My Title',
      },
      file: {
        fieldname: 'file',
        originalname: 'NAT_Recall_Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 207988,
        buffer: Buffer.from('Once upon a midnight dreary'),
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([])

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(uploadSupportingDocument).toHaveBeenCalledWith({
      data: 'T25jZSB1cG9uIGEgbWlkbmlnaHQgZHJlYXJ5',
      featureFlags: {},
      filename: 'NAT_Recall_Part_A_01022024_Smith_H_X098092.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      recommendationId: '1234',
      token: 'token1',
      type: 'OtherDocument',
      title: 'My Title',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post without file', async () => {
    const req = mockReq({
      params: {
        recommendationId: '1234',
      },
      body: {
        title: '',
      },
      file: undefined,
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([])

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(uploadSupportingDocument).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        title: '',
      },
      file: {
        fieldname: 'file',
        originalname: 'NAT_Recall?Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 25600001,
        buffer: Buffer.from('Once upon a midnight dreary'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'title',
        text: 'Enter a document title',
        href: '#title',
        errorId: 'missingTitle',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'file',
        text: 'The file must be smaller than 25MB',
        href: '#file',
        errorId: 'fileSizeExceeded',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'file',
        text: 'The filename should not contain the following characters: < > : " / \\ | ? *',
        href: '#file',
        errorId: 'invalidFilename',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
  it('post with invalid file', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        title: 'a file',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })

    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([])

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'file',
        text: 'Upload a document',
        href: '#file',
        errorId: 'missingFile',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
  it('post with duplicate title', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        title: 'title',
      },
      file: {
        fieldname: 'file',
        originalname: 'Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        buffer: Buffer.from('Once upon a midnight dreary'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([
      {
        id: 2052116145,
        recommendationId: 573594083,
        createdBy: 'MAKE_RECALL_DECISION_PPCS_USER',
        createdByUserFullName: 'Making Recall Decisions PPCS User',
        created: '2024-05-07T15:15:32.636Z',
        filename: 'NAT_Recall_Part_A_01052024_Smith_H_X098092.docx',
        type: 'OtherDocument',
        uploadedBy: 'MAKE_RECALL_DECISION_PPCS_USER',
        uploadedByUserFullName: 'Making Recall Decisions PPCS User',
        uploaded: '2024-05-07T15:15:32.636Z',
        documentUuid: 'de5f7359-e144-4c63-9645-a5186f879f21',
        title: 'title',
      },
    ])

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'title',
        text: 'Enter a unique document title',
        href: '#title',
        errorId: 'duplicateTitle',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
  it('post with upload fail', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        title: 'My Title',
      },
      file: {
        fieldname: 'file',
        originalname: 'NAT_Recall_Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        buffer: Buffer.from('Once upon a midnight dreary'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([])
    ;(uploadSupportingDocument as jest.Mock).mockImplementation(() => {
      throw new Error('somethings up')
    })

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'file',
        text: 'The selected file could not be uploaded - try again',
        href: '#file',
        errorId: 'uploadFileFailure',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
  it('post with title exceeding max len', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        title:
          '251 chars zwzwdgmdkvcshxsmonafmpnsaekvicktazfaolepnvpxlkbvmwfrpgvgwnslcbreqnxdlhwbyfvdkmzemotvujtgrfrmgsrqgucfhfayejwbrxztxkbydzhstcbrcvsxfobkdhvavjkahvxlomuellmmjcdfrhfnbjqshoyndylrqrapgfcublrbilydljqgvishdcidlzngpmzarfvrowrrwbkhebdpoaiivlhpbhiqyqlmz',
      },
      file: {
        fieldname: 'file',
        originalname: 'Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        buffer: Buffer.from('Once upon a midnight dreary'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([
      {
        id: 2052116145,
        recommendationId: 573594083,
        createdBy: 'MAKE_RECALL_DECISION_PPCS_USER',
        createdByUserFullName: 'Making Recall Decisions PPCS User',
        created: '2024-05-07T15:15:32.636Z',
        filename: 'NAT_Recall_Part_A_01052024_Smith_H_X098092.docx',
        type: 'OtherDocument',
        uploadedBy: 'MAKE_RECALL_DECISION_PPCS_USER',
        uploadedByUserFullName: 'Making Recall Decisions PPCS User',
        uploaded: '2024-05-07T15:15:32.636Z',
        documentUuid: 'de5f7359-e144-4c63-9645-a5186f879f21',
        title: 'title',
      },
    ])

    await additionalSupportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'title',
        text: 'The title must be less than 250 characters',
        href: '#title',
        errorId: 'titleLengthExceeded',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
