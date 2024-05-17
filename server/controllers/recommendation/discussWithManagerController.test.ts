import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import discussWithManagerController from './discussWithManagerController'

describe('get', () => {
  it('present with suitability for standard or fixed term recall ', async () => {
    const res = mockRes({
      locals: {
        recommendation: { isIndeterminateSentence: false, isExtendedSentence: false },
      },
    })
    const next = mockNext()
    await discussWithManagerController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'discussWithManager' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/discussWithManager')
    expect(res.locals.nextPageId).toEqual('suitability-for-fixed-term-recall')
    expect(next).toHaveBeenCalled()
  })
  it('present with indeterminate', async () => {
    const res = mockRes({
      locals: {
        recommendation: { isIndeterminateSentence: true, isExtendedSentence: false },
      },
    })
    await discussWithManagerController.get(mockReq(), res, mockNext())
    expect(res.locals.nextPageId).toEqual('recall-type-indeterminate')
  })
  it('present with extended', async () => {
    const res = mockRes({
      locals: {
        recommendation: { isIndeterminateSentence: false, isExtendedSentence: true },
      },
    })
    await discussWithManagerController.get(mockReq(), res, mockNext())
    expect(res.locals.nextPageId).toEqual('recall-type-extended')
  })
})
