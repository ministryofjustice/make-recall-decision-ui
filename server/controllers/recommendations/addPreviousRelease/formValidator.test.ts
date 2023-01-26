import { validateAddPreviousRelease } from './formValidator'

describe('validateAddPreviousRelease', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      'previousReleaseDate-day': '12',
      'previousReleaseDate-month': '05',
      'previousReleaseDate-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateAddPreviousRelease({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousReleases: {
        previousReleaseDates: ['2022-05-12'],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/previous-releases')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      'previousReleaseDate-day': '',
      'previousReleaseDate-month': '',
      'previousReleaseDate-year': '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateAddPreviousRelease({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#previousReleaseDate-day',
        name: 'previousReleaseDate',
        text: 'Enter the previous release date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      'previousReleaseDate-day': '12',
      'previousReleaseDate-month': '',
      'previousReleaseDate-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateAddPreviousRelease({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#previousReleaseDate-month',
        name: 'previousReleaseDate',
        text: 'The previous release date must include a month',
        values: {
          day: '12',
          month: '',
          year: '2022',
        },
      },
    ])
  })
})
