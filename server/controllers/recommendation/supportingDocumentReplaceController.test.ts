import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getSupportingDocuments, replaceSupportingDocument } from '../../data/makeDecisionApiClient'
import supportingDocumentReplaceController from './supportingDocumentReplaceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const PPUDPartA = {
      title: 'Part A',
      type: 'PPUDPartA',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([PPUDPartA])

    const req = mockReq({
      params: {
        type: 'part-a',
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
        recommendationId: '123',
      },
    })
    const res = mockRes()
    const next = mockNext()
    await supportingDocumentReplaceController.get(req, res, next)

    expect(getSupportingDocuments).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      featureFlags: {},
    })

    expect(res.locals.page).toEqual({ id: 'supportingDocumentReplace' })
    expect(res.locals.document).toEqual(PPUDPartA)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocumentReplace')
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
        type: 'part-a',
      },
      file: {
        fieldname: 'file',
        originalname: 'NAT_Recall_Part_A_01022024_Bloggs_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 207988,
        buffer: Buffer.from('Some random text'),
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await supportingDocumentReplaceController.post(req, res, next)

    expect(replaceSupportingDocument).toHaveBeenCalledWith({
      data: 'U29tZSByYW5kb20gdGV4dA==',
      featureFlags: {},
      title: '',
      filename: 'NAT_Recall_Part_A_01022024_Bloggs_H_X098092.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      recommendationId: '1234',
      token: 'token1',
      id: '456',
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await supportingDocumentReplaceController.post(req, res, next)

    expect(replaceSupportingDocument).not.toHaveBeenCalled()

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
        originalname: 'NAT_Recall?Part_A_01022024_Bloggs_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 25600001,
        buffer: Buffer.from('Some random text'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await supportingDocumentReplaceController.post(req, res, next)

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
        originalname: 'NAT_Recall_Part_A_01022024_Bloggs_H_X098092.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        buffer: Buffer.from('Some random text'),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()

    ;(replaceSupportingDocument as jest.Mock).mockImplementation(() => {
      throw new Error('somethings up')
    })

    await supportingDocumentReplaceController.post(req, res, next)

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
