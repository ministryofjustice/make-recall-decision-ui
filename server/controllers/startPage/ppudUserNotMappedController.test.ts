import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import config from '../../config'
import ppudUserNotMappedController from './ppudUserNotMappedController'

describe('PPUD User Not Mapped Controller', () => {
  describe('get', () => {
    const res = mockRes()
    const next = mockNext()

    beforeEach(async () => {
      jest.clearAllMocks()

      await ppudUserNotMappedController.get(mockReq(), res, next)
    })

    describe('Res locals', () => {
      it('Sets the page ID', () => expect(res.locals.page.id).toEqual('ppudUserNotMapped'))

      it('Sets the PPUD URL', () => expect(res.locals.ppudUrl).toEqual(config.ppud))
    })

    it('Renders the correct template', () => expect(res.render).toHaveBeenCalledWith('pages/ppudUserNotMapped'))

    it('Calls next', () => expect(next).toHaveBeenCalled())
  })
})
