import { validateReasonsForNoRecall } from './formValidator'

describe('validateReasonsForNoRecall', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'reasons-no-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/reasons-no-recall`,
  }

  it('returns valuesToSave with HTML tags stripped and no errors if valid', async () => {
    const requestBody = {
      licenceBreach: 'details<b>',
      noRecallRationale: '<br />details',
      popProgressMade: '<a>details</a>',
      popThoughts: '<a>details</a>',
      futureExpectations: 'details<script>test</script>',
    }
    const { errors, valuesToSave, nextPagePath } = await validateReasonsForNoRecall({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      reasonsForNoRecall: {
        licenceBreach: 'details',
        noRecallRationale: 'details',
        popProgressMade: 'details',
        popThoughts: 'details',
        futureExpectations: 'detailstest',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/appointment-no-recall')
  })

  it('if "from page" is set to no recall task list, redirect to it', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
      futureExpectations: 'details',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list-no-recall', fromAnchor: 'heading-create-letter' }
    const { nextPagePath } = await validateReasonsForNoRecall({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall#heading-create-letter`)
  })

  it('returns errors for missing licenceBreach, and no valuesToSave', async () => {
    const requestBody = {
      licenceBreach: ' ', // whitespace
      noRecallRationale: 'details',
      popProgressMade: 'details',
      popThoughts: 'details',
      futureExpectations: 'details',
    }
    const { errors, valuesToSave } = await validateReasonsForNoRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallLicenceBreachDetails',
        href: '#licenceBreach',
        name: 'licenceBreach',
        text: 'You must tell {{ fullName }} why the licence breach is a problem',
      },
    ])
  })

  it('returns errors for missing noRecallRationale, and no valuesToSave', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: ' ', // whitespace
      popProgressMade: 'details',
      popThoughts: 'details',
      futureExpectations: 'details',
    }
    const { errors, valuesToSave } = await validateReasonsForNoRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallRationale',
        href: '#noRecallRationale',
        name: 'noRecallRationale',
        text: 'You must tell {{ fullName }} why they are not being recalled',
      },
    ])
  })

  it('returns errors for missing popProgressMade, and no valuesToSave', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: ' ', // whitespace
      popThoughts: 'details',
      futureExpectations: 'details',
    }
    const { errors, valuesToSave } = await validateReasonsForNoRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallPopProgressMade',
        href: '#popProgressMade',
        name: 'popProgressMade',
        text: 'You must remind {{ fullName }} about their progress',
      },
    ])
  })

  it('returns errors for missing futureExpectations, and no valuesToSave', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
      popThoughts: 'details',
      futureExpectations: ' ', // whitespace
    }
    const { errors, valuesToSave } = await validateReasonsForNoRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noRecallFutureExpectations',
        href: '#futureExpectations',
        name: 'futureExpectations',
        text: "You must tell {{ fullName }} what you've agreed for the future",
      },
    ])
  })

  it('returns unsaved values if there are errors', async () => {
    const requestBody = {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
      popThoughts: 'details',
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
        text: "You must tell {{ fullName }} what you've agreed for the future",
      },
    ])
    expect(unsavedValues).toEqual(requestBody)
  })
})
