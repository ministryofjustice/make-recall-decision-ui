import { validateManagerRecordDecisionDelius } from './formValidator'
import { EVENTS } from '../../../utils/constants'

describe('validateManagerRecordDecisionDelius', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'manager-record-decision-delius',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/manager-record-decision-delius`,
  }

  describe('valid', () => {
    it('returns valuesToSave & monitoringEvent and redirects to confirmation page', async () => {
      const { errors, valuesToSave, nextPagePath, monitoringEvent } = await validateManagerRecordDecisionDelius({
        requestBody: {
          managerRecallDecision: 'RECALL',
        },
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
      expect(monitoringEvent).toEqual({
        eventName: EVENTS.MRD_MANAGER_DECISION_RECORDED_IN_DELIUS,
        data: {
          managerRecallDecision: 'RECALL',
        },
      })
    })

    it('returns errors if managerRecallDecision is invalid', async () => {
      const { errors } = await validateManagerRecordDecisionDelius({
        requestBody: {
          managerRecallDecision: 'BANANA_TOAST',
        },
        recommendationId,
        urlInfo,
      })
      expect(errors).toEqual([
        {
          errorId: 'noManagerRecallTypeSelected',
          href: '#managerRecallDecision',
          name: 'managerRecallDecision',
          text: 'Select whether you recommend a recall or not',
        },
      ])
    })
  })
})
