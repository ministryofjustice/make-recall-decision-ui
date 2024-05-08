import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getSupportingDocuments, replaceSupportingDocument } from '../../data/makeDecisionApiClient'
import additionalSupportingDocumentReplaceController from './additionalSupportingDocumentReplaceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const additionalDocument = {
      title: 'Some Title',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([additionalDocument])

    const req = mockReq({
      params: {
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
        recommendationId: '123',
      },
    })
    const res = mockRes()
    const next = mockNext()
    await additionalSupportingDocumentReplaceController.get(req, res, next)

    expect(getSupportingDocuments).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      featureFlags: {},
    })

    expect(res.locals.page).toEqual({ id: 'additionalSupportingDocumentReplace' })
    expect(res.locals.document).toEqual(additionalDocument)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/additionalSupportingDocumentReplace')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with file', async () => {
    const req = mockReq({
      params: {
        recommendationId: '1234',
        id: '456',
      },
      body: {
        title: 'some title',
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

    await additionalSupportingDocumentReplaceController.post(req, res, next)

    expect(replaceSupportingDocument).toHaveBeenCalledWith({
      data: 'T25jZSB1cG9uIGEgbWlkbmlnaHQgZHJlYXJ5',
      featureFlags: {},
      title: 'some title',
      filename: 'NAT_Recall_Part_A_01022024_Smith_H_X098092.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      recommendationId: '1234',
      token: 'token1',
      id: '456',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with only a new title', async () => {
    const req = mockReq({
      params: {
        recommendationId: '1234',
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      },
      body: {
        title: 'some new title',
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

    const OtherDocument = {
      title: 'some title',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([OtherDocument])

    await additionalSupportingDocumentReplaceController.post(req, res, next)

    expect(replaceSupportingDocument).toHaveBeenCalledWith({
      featureFlags: {},
      title: 'some new title',
      recommendationId: '1234',
      token: 'token1',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      },
      body: {
        title: '',
      },
      file: {
        fieldname: 'file',
        originalname: 'NAT_Recall?Part_A_01022024_Smith_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512001,
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

    const OtherDocument = {
      title: 'some title',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([OtherDocument])

    await additionalSupportingDocumentReplaceController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingTitle',
        href: '#title',
        name: 'title',
        text: 'Enter a document title',
      },
      {
        name: 'file',
        text: 'The file must be smaller than 500KB',
        href: '#file',
        errorId: 'fileSizeExceeded',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'file',
        text: 'The filename should only contain letters, numbers, apostrophes, hyphens and underscores',
        href: '#file',
        errorId: 'invalidFilename',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
  it('post with invalid title', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      },
      body: {
        title: 'some new title',
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

    const OtherDocument = {
      title: 'some new title',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-1111-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([OtherDocument])

    await additionalSupportingDocumentReplaceController.post(req, res, next)

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
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
      },
      body: {
        title: 'some title',
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

    const OtherDocument = {
      title: 'some title',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([OtherDocument])
    ;(replaceSupportingDocument as jest.Mock).mockImplementation(() => {
      throw new Error('somethings up')
    })

    await additionalSupportingDocumentReplaceController.post(req, res, next)

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
})
