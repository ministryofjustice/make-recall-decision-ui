import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import deletePpudUserMappingController from './deletePpudUserMappingController'
import { deletePpudUserMappingById, getPpudUserMappingById } from '../../../../data/makeDecisionApiClient'
import validatePpudUserMapping from './ppudUserMappingValidator'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('./ppudUserMappingValidator')

describe('Add PPUD User Mapping Controller', () => {
  describe('get', () => {
    const res = mockRes()
    const next = mockNext()

    const userMapping = PpudUserMappingFullGenerator.generate()

    beforeEach(async () => {
      jest.clearAllMocks()
      ;(getPpudUserMappingById as jest.Mock).mockResolvedValue(userMapping)

      await deletePpudUserMappingController.get(mockReq({ params: { ppudUserMappingId: userMapping.id } }), res, next)
    })

    describe('Sets response locals correctly', () => {
      it('Page ID', () => expect(res.locals.page.id).toEqual('deletePpudUserMapping'))
      it('User mapping', () => expect(res.locals.userMapping).toEqual(userMapping))
    })
    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render to for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/ppudUserMapping/deletePpudUserMapping'))
    it('Executes the next function ', async () => expect(next).toHaveBeenCalled())
    it('Calls getPpudUserMappingById with the expected parameters', async () =>
      expect(getPpudUserMappingById).toHaveBeenCalledWith(userMapping.id, res.locals.user.token))
  })

  describe('post', () => {
    const req = mockReq({
      params: {
        ppudUserMappingId: faker.number.int().toString(),
      },
    })
    const res = mockRes()
    const next = mockNext()
    beforeEach(async () => {
      jest.clearAllMocks()
      ;(deletePpudUserMappingById as jest.Mock).mockResolvedValue({})

      await deletePpudUserMappingController.post(req, res, next)
    })

    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls deletePpudUserMappingById with the expected parameters', () =>
      expect(deletePpudUserMappingById).toHaveBeenCalledWith(req.params.ppudUserMappingId, res.locals.user.token))
    it('Redirects to the PPUD User Mappings page', () =>
      expect(res.redirect).toHaveBeenCalledWith(303, ppcsPaths.ppudUserMappings))
    it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
  })
})
