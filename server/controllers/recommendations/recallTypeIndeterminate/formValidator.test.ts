import { validateRecallTypeIndeterminate } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { EVENTS } from '../../../utils/constants'

describe('validateRecallTypeIndeterminate', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'recall-type',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/recall-type`,
  }

  describe('valid', () => {
    it('returns valuesToSave and redirects to no recall start page if valid no recall selected', async () => {
      const requestBody = {
        recallType: 'NO_RECALL',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateRecallTypeIndeterminate({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'NO_RECALL',
          },
          allOptions: formOptions.recallTypeIndeterminateApi,
        },
        isThisAnEmergencyRecall: null,
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
    })

    it('returns monitoring event data', async () => {
      const requestBody = {
        recallType: 'EMERGENCY',
        crn: 'X34534',
      }
      const { monitoringEvent } = await validateRecallTypeIndeterminate({ requestBody, recommendationId, urlInfo })
      expect(monitoringEvent).toEqual({
        eventName: EVENTS.MRD_RECALL_TYPE,
        data: {
          recallType: 'EMERGENCY_IND_EXT',
        },
      })
    })

    it('returns valuesToSave and redirects if emergency recall selected', async () => {
      const requestBody = {
        recallType: 'EMERGENCY',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateRecallTypeIndeterminate({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'STANDARD',
          },
          allOptions: formOptions.recallTypeIndeterminateApi,
        },
        isThisAnEmergencyRecall: true,
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/indeterminate-details`)
    })

    describe('Redirects', () => {
      it('if "from page" is set, ignore it if an emergency recall is selected', async () => {
        const requestBody = {
          recallType: 'EMERGENCY',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallTypeIndeterminate({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/indeterminate-details`)
      })

      it('if "from page" is set, ignore it if No recall is selected', async () => {
        const requestBody = {
          recallType: 'NO_RECALL',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallTypeIndeterminate({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
      })
    })
  })

  describe('invalid', () => {
    it('returns an error for the decision, if not set', async () => {
      const requestBody = {
        recallType: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallTypeIndeterminate({ requestBody, recommendationId, urlInfo })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#recallType',
          name: 'recallType',
          text: 'Select whether you recommend a recall or not',
          errorId: 'noRecallTypeIndeterminateSelected',
        },
      ])
    })

    it('returns an error, if recallType is set to an invalid value', async () => {
      const requestBody = {
        recallType: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallTypeIndeterminate({ requestBody, recommendationId, urlInfo })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#recallType',
          name: 'recallType',
          text: 'Select whether you recommend a recall or not',
          errorId: 'noRecallTypeIndeterminateSelected',
        },
      ])
    })
  })
})
