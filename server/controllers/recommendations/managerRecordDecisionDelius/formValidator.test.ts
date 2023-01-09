import { validateManagerRecordDecisionDelius } from './formValidator'

describe('validateManagerRecordDecisionDelius', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'manager-record-decision-delius',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/manager-record-decision-delius`,
  }

  describe('valid', () => {
    it('returns valuesToSave and redirects to confirmation page', async () => {
      const { errors, valuesToSave, nextPagePath } = await validateManagerRecordDecisionDelius({
        requestBody: {},
        recommendationId,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        managerRecallDecision: {
          isSentToDelius: true,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/manager-decision-confirmation`)
    })
  })
})
