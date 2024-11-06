import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { uploadSupportingDocument } from '../../data/makeDecisionApiClient'
import supportingDocumentUploadController from './supportingDocumentUploadController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const req = mockReq({
      params: {
        type: 'part-a',
      },
    })
    const res = mockRes()
    const next = mockNext()
    await supportingDocumentUploadController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'supportingDocumentUpload' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocumentUpload')
    expect(res.locals.type).toEqual('part-a')
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
        type: 'part-a',
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
    await supportingDocumentUploadController.post(req, res, next)

    expect(uploadSupportingDocument).toHaveBeenCalledWith({
      data: 'T25jZSB1cG9uIGEgbWlkbmlnaHQgZHJlYXJ5',
      featureFlags: {},
      filename: 'NAT_Recall_Part_A_01022024_Smith_H_X098092.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      recommendationId: '1234',
      token: 'token1',
      type: 'PPUDPartA',
      title: '',
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
        type: 'part-a',
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
    await supportingDocumentUploadController.post(req, res, next)

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
        type: 'part-a',
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
    await supportingDocumentUploadController.post(req, res, next)

    expect(req.session.errors).toEqual([
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
  it('post with upload fail', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        type: 'part-a',
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

    ;(uploadSupportingDocument as jest.Mock).mockImplementation(() => {
      throw new Error('somethings up')
    })

    await supportingDocumentUploadController.post(req, res, next)

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

  it.each([
    ['filename.doc', true],
    ['filename.docx', true],
    ['Preview NAT Recall Part A London Template - obtained 231114.docx', true],
    ['Preview (NAT) Recall_Part - A London Template - obtained 231114.docx', true],
    ['filename.doc', true],
    ['filename.do', false],
    ['file<name.doc', false],
    ['file>name.doc', false],
    ['file:name.doc', false],
    ['file/name.doc', false],
    ['file\\name.doc', false],
    ['file|name.doc', false],
    ['file?name.doc', false],
    ['file*name.doc', false],
  ])('when the filename is \'%s\' then permitted = \'%s\'', (fileName, allowed) => {
    /* eslint-disable prettier/prettier */
    expect(fileName.match(/^[^"<>|:*?/\\]+.[a-zA-Z]{3,4}$/) != null).toEqual(allowed)
  })
})
