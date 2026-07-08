import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import discussWithManagerController from './discussWithManagerController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

describe('get', () => {
  describe('Discuss with Manager', () => {
    it('present with Youth SDS', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            sentenceGroup: SentenceGroup.YOUTH_SDS,
          },
          flags: {},
        },
      })
      const next = mockNext()
      await discussWithManagerController.get(mockReq(), res, next)

      expect(res.locals.page).toEqual({ id: 'discussWithManager' })
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/discussWithManager')
      expect(res.locals.nextPageId).toEqual('suitability-for-fixed-term-recall')
      expect(next).toHaveBeenCalled()
    })

    it('present with Adult SDS', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            sentenceGroup: SentenceGroup.ADULT_SDS,
          },
          flags: {},
        },
      })
      await discussWithManagerController.get(mockReq(), res, mockNext())
      expect(res.locals.nextPageId).toEqual('check-mappa-information')
    })

    it('present with indeterminate', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            sentenceGroup: SentenceGroup.INDETERMINATE,
          },
          flags: {},
        },
      })
      await discussWithManagerController.get(mockReq(), res, mockNext())
      expect(res.locals.nextPageId).toEqual('recall-type-indeterminate')
    })

    it('present with extended', async () => {
      const res = mockRes({
        locals: {
          recommendation: {
            sentenceGroup: SentenceGroup.EXTENDED,
          },
          flags: {},
        },
      })
      await discussWithManagerController.get(mockReq(), res, mockNext())
      expect(res.locals.nextPageId).toEqual('recall-type-extended')
    })
  })
})
