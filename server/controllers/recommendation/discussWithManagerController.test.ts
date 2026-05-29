import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import discussWithManagerController from './discussWithManagerController'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

describe('get', () => {
  const ftr56TestCases = [
    {
      description: 'with FTR56 flag enabled',
      ftr56Enabled: true,
    },
  ]
  ftr56TestCases.forEach(({ description, ftr56Enabled }) => {
    describe(description, () => {
      it('present with Youth SDS', async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              sentenceGroup: SentenceGroup.YOUTH_SDS,
            },
            flags: { flagFTR56Enabled: ftr56Enabled },
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
              sentenceGroup: ftr56Enabled ? SentenceGroup.ADULT_SDS : undefined,
            },
            flags: { flagFTR56Enabled: ftr56Enabled },
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
            flags: { flagFTR56Enabled: ftr56Enabled },
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
            flags: { flagFTR56Enabled: ftr56Enabled },
          },
        })
        await discussWithManagerController.get(mockReq(), res, mockNext())
        expect(res.locals.nextPageId).toEqual('recall-type-extended')
      })
    })
  })
})
