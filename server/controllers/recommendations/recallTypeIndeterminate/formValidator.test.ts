import { validateRecallTypeIndeterminate } from './formValidator'
import { formOptions } from '../helpers/formOptions'

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
          allOptions: formOptions.recallType,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/start-no-recall`)
    })

    it('returns valuesToSave and redirects if valid standard recall selected', async () => {
      const requestBody = {
        recallType: 'STANDARD',
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
          allOptions: formOptions.recallType,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/sensitive-info`)
    })

    describe('Redirects', () => {
      it('if "from page" is set to recall task list, redirects to it if a standard recall is selected', async () => {
        const requestBody = {
          recallType: 'STANDARD',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallTypeIndeterminate({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-recommendation`)
      })

      it('if "from page" is set to recall task list, don\'t redirect to it if No recall is selected', async () => {
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
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/start-no-recall`)
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
          text: 'You must select a recommendation',
          errorId: 'noRecallTypeSelected',
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
          text: 'You must select a recommendation',
          errorId: 'noRecallTypeSelected',
        },
      ])
    })
  })
})
