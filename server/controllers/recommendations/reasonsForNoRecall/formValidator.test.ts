import { validateReasonsForNoRecall } from './formValidator'

describe('validateReasonsForNoRecall', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'reasons-no-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/reasons-no-recall`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
      futureExpectations: 'details',
    }
    const { errors, valuesToSave, nextPagePath } = await validateReasonsForNoRecall({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      reasonsForNoRecall: requestBody,
    })
    expect(nextPagePath).toEqual('/recommendations/34/appointment-no-recall')
  })

  it('returns errors for missing fields, and no valuesToSave', async () => {
    const requestBody = {}
    const { errors, valuesToSave } = await validateReasonsForNoRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallLicenceBreachDetails',
        href: '#licenceBreach',
        name: 'licenceBreach',
        text: 'You must explain the licence breach',
      },
      {
        errorId: 'noRecallRationale',
        href: '#noRecallRationale',
        name: 'noRecallRationale',
        text: 'You must explain your rationale for not recalling {{ fullName }}',
      },
      {
        errorId: 'noRecallPopProgressMade',
        href: '#popProgressMade',
        name: 'popProgressMade',
        text: 'You must explain what progress {{ fullName }} has made so far',
      },
      {
        errorId: 'noRecallFutureExpectations',
        href: '#futureExpectations',
        name: 'futureExpectations',
        text: 'You must explain what is expected in the future',
      },
    ])
  })

  it('returns unsaved values if there are errors', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
    }
    const { errors, unsavedValues, valuesToSave } = await validateReasonsForNoRecall({
      requestBody,
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallFutureExpectations',
        href: '#futureExpectations',
        name: 'futureExpectations',
        text: 'You must explain what is expected in the future',
      },
    ])
    expect(unsavedValues).toEqual(requestBody)
  })
})
