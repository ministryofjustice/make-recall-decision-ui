import { validatePreviousReleases } from './formValidator'

describe('validatePreviousReleases', () => {
  const recommendationId = '34'

  it('returns valuesToSave and no errors if YES', async () => {
    const requestBody = {
      crn: 'X34534',
      hasBeenReleasedPreviously: 'YES',
    }
    const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousReleases: {
        hasBeenReleasedPreviously: true,
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/add-previous-release')
  })

  it('returns valuesToSave and no errors if NO', async () => {
    const requestBody = {
      crn: 'X34534',
      hasBeenReleasedPreviously: 'NO',
    }
    const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousReleases: {
        hasBeenReleasedPreviously: false,
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
  })

  it('returns an error, if hasBeenReleasedPreviously not set, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X34534',
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
})
