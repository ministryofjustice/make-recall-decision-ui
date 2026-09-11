import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import addPpudUserMappingController from './addPpudUserMappingController'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'
import { createPpudUserMapping, updatePpudUserMapping } from '../../../../data/makeDecisionApiClient'
import validatePpudUserMapping from './ppudUserMappingValidator'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'
import NamedFormErrorGenerator from '../../../../../data/common/errorGenerator'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('./ppudUserMappingValidator')

describe('Add PPUD User Mapping Controller', () => {
  describe('get', () => {
    const res = mockRes()
    const next = mockNext()

    beforeEach(async () => {
      jest.clearAllMocks()

      await addPpudUserMappingController.get(mockReq(), res, next)
    })

    describe('Sets response locals correctly', () => {
      it('Page ID', () => expect(res.locals.page.id).toEqual('addPpudUserMapping'))
      it('Action is "Add"', () => expect(res.locals.action).toEqual('Add'))
    })
    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render to for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/ppudUserMapping/editPpudUserMapping'))
    it('Executes the next function ', async () => expect(next).toHaveBeenCalled())
  })

  describe('post', () => {
    const userMapping = PpudUserMappingFullGenerator.generate()

    const req = mockReq({
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
        ;(createPpudUserMapping as jest.Mock).mockResolvedValue({})

        await addPpudUserMappingController.post(req, res, next)
      })

      it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
      it('Calls validatePpudUserMapping with the expected parameters', () =>
        expect(validatePpudUserMapping).toHaveBeenCalledWith(req.body, res.locals.user.token))
      it('Calls createPpudUserMapping with the expected parameters', () =>
        expect(createPpudUserMapping).toHaveBeenCalledWith(
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
        ;(createPpudUserMapping as jest.Mock).mockResolvedValue({})

        await addPpudUserMappingController.post(req, res, next)
      })

      it('Sets the error messages in req.session.errors', () => expect(req.session.errors).toEqual(validationErrors))
      it('Calls validatePpudUserMapping with the expected parameters', () =>
        expect(validatePpudUserMapping).toHaveBeenCalledWith(req.body, res.locals.user.token))
      it('Redirects to this same page', () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${ppcsPaths.ppudUserMappings}/add`))
      it('Does not call createPpudUserMapping', () => expect(createPpudUserMapping).not.toHaveBeenCalled())
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })
  })
})
