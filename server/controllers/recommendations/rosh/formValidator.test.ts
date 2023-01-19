import { validateRosh } from './formValidator'

describe('validateRosh', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'rosh',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/rosh`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      riskToChildren: 'LOW',
      riskToPublic: 'HIGH',
      riskToKnownAdult: 'MEDIUM',
      riskToStaff: 'VERY_HIGH',
      riskToPrisoners: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateRosh({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      currentRoshForPartA: {
        riskToChildren: 'LOW',
        riskToPublic: 'HIGH',
        riskToKnownAdult: 'MEDIUM',
        riskToStaff: 'VERY_HIGH',
        riskToPrisoners: 'NOT_APPLICABLE',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-risk-profile')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      riskToChildren: '',
      riskToPublic: 'HIGH',
      riskToKnownAdult: 'MEDIUM',
      riskToStaff: 'VERY_HIGH',
      riskToPrisoners: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateRosh({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingRosh',
        href: '#riskToChildren',
        name: 'riskToChildren',
        text: 'Select a RoSH level for the risk to children',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      riskToChildren: 'LOW',
      riskToPublic: 'HIGH',
      riskToKnownAdult: 'MEDIUM',
      riskToStaff: 'BANANA',
      riskToPrisoners: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateRosh({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingRosh',
        href: '#riskToStaff',
        name: 'riskToStaff',
        text: 'Select a RoSH level for the risk to staff',
      },
    ])
  })
})
