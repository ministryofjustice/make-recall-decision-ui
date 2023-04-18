import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import previewNoRecallLetterController from './previewNoRecallLetterController'
import { createDocument } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present', async () => {
    ;(createDocument as jest.Mock).mockResolvedValue({ letterContent: 'CONTENT' })
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await previewNoRecallLetterController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'previewNoRecallLetter' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/previewNoRecallLetter')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.letterContent).toEqual('CONTENT')
    expect(next).toHaveBeenCalled()
  })
})
