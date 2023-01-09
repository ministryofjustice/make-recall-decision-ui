import { validateManagerRecordDecision } from './formValidator'
import { formOptions } from '../formOptions/formOptions'

describe('validateManagerRecordDecision', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'manager-record-decision',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/manager-record-decision`,
  }

  describe('valid', () => {
    it('returns valuesToSave and redirects to record delius decision page if valid decision selected', async () => {
      const requestBody = {
        recallTypeManager: 'NO_RECALL',
        recallTypeManagerDetail: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateManagerRecordDecision({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        managerRecallDecision: {
          selected: {
            value: requestBody.recallTypeManager,
            details: requestBody.recallTypeManagerDetail,
          },
          allOptions: formOptions.recallTypeManager,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/manager-record-decision-delius`)
    })
  })

  describe('invalid', () => {
    it('returns an error for the decision, if not set', async () => {
      const requestBody = {
        recallTypeManager: '',
        recallTypeManagerDetail: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateManagerRecordDecision({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallTypeManager: '',
        recallTypeManagerDetail: 'Details...',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeManager',
          name: 'recallTypeManager',
          text: 'Select whether you recommend a recall or not',
          errorId: 'noManagerRecallTypeSelected',
        },
      ])
    })

    it('returns an error for missing detail', async () => {
      const requestBody = {
        recallTypeManager: 'RECALL',
        recallTypeManagerDetail: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateManagerRecordDecision({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallTypeManager: 'RECALL',
        recallTypeManagerDetail: '',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeManagerDetail',
          name: 'recallTypeManagerDetail',
          text: 'You must explain your decision',
          errorId: 'missingManagerRecallTypeDetail',
        },
      ])
    })

    it('returns an error, if recallTypeManager is set to an invalid value', async () => {
      const requestBody = {
        recallTypeManager: 'BANANA',
        recallTypeManagerDetail: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateManagerRecordDecision({ requestBody, recommendationId, urlInfo })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#recallTypeManager',
          name: 'recallTypeManager',
          text: 'Select whether you recommend a recall or not',
          errorId: 'noManagerRecallTypeSelected',
        },
      ])
    })
  })
})
