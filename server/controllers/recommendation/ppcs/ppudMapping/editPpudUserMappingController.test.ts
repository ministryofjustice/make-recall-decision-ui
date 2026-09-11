import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import editPpudUserMappingController from './editPpudUserMappingController'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'
import { getPpudUserMappingById, updatePpudUserMapping } from '../../../../data/makeDecisionApiClient'
import validatePpudUserMapping from './ppudUserMappingValidator'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'
import NamedFormErrorGenerator from '../../../../../data/common/errorGenerator'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('./ppudUserMappingValidator')

describe('Edit PPUD User Mapping Controller', () => {
  describe('get', () => {
    const res = mockRes()
    const next = mockNext()

    const userMapping = PpudUserMappingFullGenerator.generate()

    beforeEach(async () => {
      jest.clearAllMocks()
      ;(getPpudUserMappingById as jest.Mock).mockResolvedValue(userMapping)

      await editPpudUserMappingController.get(mockReq({ params: { ppudUserMappingId: userMapping.id } }), res, next)
    })

    describe('Sets response locals correctly', () => {
      it('Page ID', () => expect(res.locals.page.id).toEqual('editPpudUserMapping'))
      it('User mapping', () => expect(res.locals.userMapping).toEqual(userMapping))
      it('Action is "Update"', () => expect(res.locals.action).toEqual('Update'))
    })
    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render to for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/ppudUserMapping/editPpudUserMapping'))
    it('Executes the next function ', async () => expect(next).toHaveBeenCalled())
    it('Calls getPpudUserMappingById with the expected parameters', async () =>
      expect(getPpudUserMappingById).toHaveBeenCalledWith(userMapping.id, res.locals.user.token))
  })

  describe('post', () => {
    const userMapping = PpudUserMappingFullGenerator.generate()

    const req = mockReq({
      params: { ppudUserMappingId: userMapping.id },
      body: {
        userName: userMapping.userName,
        ppudUserFullName: userMapping.ppudUserFullName,
        ppudTeamName: userMapping.ppudTeamName,
        ppudUserName: userMapping.ppudUserName,
      },
    })
    const res = mockRes()
    const next = mockNext()

    describe('valid submission', () => {
      beforeEach(async () => {
        jest.clearAllMocks()
        ;(validatePpudUserMapping as jest.Mock).mockResolvedValue({ errors: [] })
        ;(updatePpudUserMapping as jest.Mock).mockResolvedValue({})

        await editPpudUserMappingController.post(req, res, next)
      })

      it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
      it('Calls validatePpudUserMapping with the expected parameters', () =>
        expect(validatePpudUserMapping).toHaveBeenCalledWith(userMapping, res.locals.user.token))
      it('Calls updatePpudUserMapping with the expected parameters', () =>
        expect(updatePpudUserMapping).toHaveBeenCalledWith(
          userMapping.id,
          {
            userName: userMapping.userName,
            ppudUserFullName: userMapping.ppudUserFullName,
            ppudTeamName: userMapping.ppudTeamName,
            ppudUserName: userMapping.ppudUserName,
          },
          res.locals.user.token,
        ))
      it('Redirects to the PPUD User Mappings page', () =>
        expect(res.redirect).toHaveBeenCalledWith(303, ppcsPaths.ppudUserMappings))
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })

    describe('invalid submission', () => {
      const validationErrors = faker.helpers.multiple(() => NamedFormErrorGenerator.generate())
      beforeEach(async () => {
        jest.clearAllMocks()
        ;(validatePpudUserMapping as jest.Mock).mockResolvedValue(validationErrors)
        ;(updatePpudUserMapping as jest.Mock).mockResolvedValue({})

        await editPpudUserMappingController.post(req, res, next)
      })

      it('Sets the error messages in req.session.errors', () => expect(req.session.errors).toEqual(validationErrors))
      it('Calls validatePpudUserMapping with the expected parameters', () =>
        expect(validatePpudUserMapping).toHaveBeenCalledWith(
          { ...req.body, id: userMapping.id },
          res.locals.user.token,
        ))
      it('Redirects to this same page', () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${ppcsPaths.ppudUserMappings}/${userMapping.id}/edit`))
      it('Does not call updatePpudUserMapping', () => expect(updatePpudUserMapping).not.toHaveBeenCalled())
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })
  })
})
