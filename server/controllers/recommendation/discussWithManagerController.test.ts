import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import discussWithManagerController from './discussWithManagerController'
import randomEnum from '../../@types/enum.testFactory'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

describe('get', () => {
  const ftr56TestCases = [
    {
      description: 'with FTR56 flag enabled',
      ftr56Enabled: true,
    },
    {
      description: 'with FTR56 flag disabled',
      ftr56Enabled: false,
    },
  ]
  ftr56TestCases.forEach(({ description, ftr56Enabled }) => {
    describe(description, () => {
      it('present with suitability for standard or fixed term recall ', async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              isIndeterminateSentence: ftr56Enabled ? undefined : false,
              isExtendedSentence: ftr56Enabled ? undefined : false,
              sentenceGroup: ftr56Enabled
                ? randomEnum(SentenceGroup, [SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED])
                : undefined,
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
      it('present with indeterminate', async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              isIndeterminateSentence: ftr56Enabled ? undefined : true,
              isExtendedSentence: ftr56Enabled ? undefined : false,
              sentenceGroup: ftr56Enabled ? SentenceGroup.INDETERMINATE : undefined,
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
              isIndeterminateSentence: ftr56Enabled ? undefined : false,
              isExtendedSentence: ftr56Enabled ? undefined : true,
              sentenceGroup: ftr56Enabled ? SentenceGroup.EXTENDED : undefined,
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
