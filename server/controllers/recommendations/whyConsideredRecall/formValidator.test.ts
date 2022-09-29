import { validateWhyConsideredRecall } from './formValidator'
import { formOptions } from '../formOptions/formOptions'

describe('validateWhyConsideredRecall', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'why-considered-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/why-considered-recall`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      whyConsideredRecall: 'RISK_INCREASED',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateWhyConsideredRecall({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      whyConsideredRecall: {
        allOptions: formOptions.whyConsideredRecall,
        selected: 'RISK_INCREASED',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/reasons-no-recall')
  })

  it('if "from page" is set to no recall task list, redirect to it', async () => {
    const requestBody = {
      whyConsideredRecall: 'RISK_INCREASED',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list-no-recall', fromAnchor: 'heading-create-letter' }
    const { nextPagePath } = await validateWhyConsideredRecall({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall#heading-create-letter`)
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      whyConsideredRecall: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateWhyConsideredRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#whyConsideredRecall',
        name: 'whyConsideredRecall',
        text: 'Select a reason why you considered recall',
        errorId: 'noWhyConsideredRecallSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      whyConsideredRecall: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateWhyConsideredRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#whyConsideredRecall',
        name: 'whyConsideredRecall',
        text: 'Select a reason why you considered recall',
        errorId: 'noWhyConsideredRecallSelected',
      },
    ])
  })
})
