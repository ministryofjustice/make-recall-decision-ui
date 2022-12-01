import { validatePreviousReleases } from './formValidator'

describe('validatePreviousReleases', () => {
  const recommendationId = '34'
  const defaultRequestBody = {
    lastReleaseDate: '2022-10-01',
    lastReleasingPrisonOrCustodialEstablishment: 'HMP Wandsworth',
    crn: 'X34534',
  }
  it('returns valuesToSave and no errors if YES', async () => {
    const requestBody = {
      ...defaultRequestBody,
      hasBeenReleasedPreviously: 'YES',
    }
    const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousReleases: {
        lastReleaseDate: '2022-10-01',
        lastReleasingPrisonOrCustodialEstablishment: 'HMP Wandsworth',
        hasBeenReleasedPreviously: true,
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
  })

  it('returns valuesToSave and no errors if NO', async () => {
    const requestBody = {
      ...defaultRequestBody,
      hasBeenReleasedPreviously: 'NO',
    }
    const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousReleases: {
        lastReleaseDate: '2022-10-01',
        lastReleasingPrisonOrCustodialEstablishment: 'HMP Wandsworth',
        hasBeenReleasedPreviously: false,
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
  })

  it('returns an error, if hasBeenReleasedPreviously not set, and no valuesToSave', async () => {
    const requestBody = {
      ...defaultRequestBody,
      hasBeenReleasedPreviously: '',
    }
    const { errors, valuesToSave } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasBeenReleasedPreviously',
        name: 'hasBeenReleasedPreviously',
        text: 'Select whether {{ fullName }} has been released previously',
        errorId: 'noHasBeenReleasedPreviouslySelected',
      },
    ])
  })

  it('returns an error, if lastReleasingPrisonOrCustodialEstablishment not set, and no valuesToSave', async () => {
    const requestBody = {
      lastReleaseDate: '2022-10-01',
      hasBeenReleasedPreviously: 'NO',
    }
    const { errors, valuesToSave } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'invalidLastReleasingPrisonOrCustodialEstablishment',
        href: '#lastReleasingPrisonOrCustodialEstablishment',
        name: 'lastReleasingPrisonOrCustodialEstablishment',
        text: 'Provide a valid last releasing prison',
      },
    ])
  })

  it('returns an error, if lastReleaseDate not set, and no valuesToSave', async () => {
    const requestBody = {
      lastReleasingPrisonOrCustodialEstablishment: 'HMP Wandsworth',
      hasBeenReleasedPreviously: 'NO',
    }
    const { errors, valuesToSave } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'invalidLastReleaseDate',
        href: '#lastReleaseDate',
        name: 'lastReleaseDate',
        text: 'Provide a valid last release date',
      },
    ])
  })
})
