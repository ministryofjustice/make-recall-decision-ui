import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'
import ppudUserMappingsController from './ppudUserMappingsController'

jest.mock('../../../../data/makeDecisionApiClient')

describe('PPUD User Mappings Controller', () => {
  describe('get', () => {
    const res = mockRes({ locals: { user: { token: 'token' } } })
    const next = mockNext()

    const userMappings = faker.helpers.multiple(() => PpudUserMappingFullGenerator.generate())

    beforeEach(async () => {
      jest.clearAllMocks()
      ;(getPpudUserMappings as jest.Mock).mockResolvedValue(userMappings)

      await ppudUserMappingsController.get(mockReq(), res, next)
    })

    describe('Res locals', () => {
      it('Sets the page ID', () => expect(res.locals.page.id).toEqual('ppudUserMappings'))
      it('Sets the user mappings', () => expect(res.locals.userMappings).toEqual(userMappings))
    })
    it('Renders the correct template', () =>
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/ppudUserMapping/ppudUserMappings'))
    it('Calls next', () => expect(next).toHaveBeenCalled())
    it('Calls the API to get the user mappings', () => expect(getPpudUserMappings).toHaveBeenCalledWith('token'))
  })
})
