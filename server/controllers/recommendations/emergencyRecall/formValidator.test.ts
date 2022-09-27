import { validateEmergencyRecall } from './formValidator'

describe('validateEmergencyRecall', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'emergency-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/emergency-recall`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'YES',
      recallType: 'STANDARD',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateEmergencyRecall({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isThisAnEmergencyRecall: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/sensitive-info')
  })

  it("redirects to fixed term licence conditions if it's a fixed term recall", async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'YES',
      recallType: 'FIXED_TERM',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateEmergencyRecall({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isThisAnEmergencyRecall: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/fixed-licence')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateEmergencyRecall({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isThisAnEmergencyRecall',
        name: 'isThisAnEmergencyRecall',
        text: 'You must select whether this is an emergency recall or not',
        errorId: 'noEmergencyRecallSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateEmergencyRecall({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isThisAnEmergencyRecall',
        name: 'isThisAnEmergencyRecall',
        text: 'You must select whether this is an emergency recall or not',
        errorId: 'noEmergencyRecallSelected',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'YES',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateEmergencyRecall({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })
})
