import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import supportingDocumentsController from './supportingDocumentsController'
import { getSupportingDocuments } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const PPUDPartA = {
      title: 'Part A',
      type: 'PPUDPartA',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    const OtherDocument = {
      title: 'Some Document',
      type: 'OtherDocument',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098044.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9f',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([PPUDPartA, OtherDocument])

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            minute: 'some text',
          },
        },
        token: 'token1',
      },
    })

    const next = mockNext()
    await supportingDocumentsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'supportingDocuments' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocuments')
    expect(res.locals.PPUDPartA).toEqual(PPUDPartA)
    expect(res.locals.minute).toEqual('some text')
    expect(res.locals.additionalDocuments).toEqual([OtherDocument])
    expect(next).toHaveBeenCalled()
  })
  it('load with no minute', async () => {
    const PPUDPartA = {
      title: 'Part A',
      type: 'PPUDPartA',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([PPUDPartA])

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            minute: '',
          },
        },
        token: 'token1',
      },
    })

    const next = mockNext()
    await supportingDocumentsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'supportingDocuments' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocuments')
    expect(res.locals.PPUDPartA).toEqual(PPUDPartA)
    expect(res.locals.minute).toEqual('')
    expect(next).toHaveBeenCalled()
  })
})
