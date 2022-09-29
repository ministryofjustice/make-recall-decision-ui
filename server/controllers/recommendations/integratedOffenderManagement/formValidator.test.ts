import { validateIntegratedOffenderManagement } from './formValidator'
import { formOptions } from '../formOptions/formOptions'

describe('validateIntegratedOffenderManagement', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if Yes selected', async () => {
    const requestBody = {
      isUnderIntegratedOffenderManagement: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIntegratedOffenderManagement({
      requestBody,
      recommendationId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isUnderIntegratedOffenderManagement: {
        allOptions: formOptions.isUnderIntegratedOffenderManagement,
        selected: 'YES',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-custody')
  })

  it('returns valuesToSave and no errors if No selected', async () => {
    const requestBody = {
      isUnderIntegratedOffenderManagement: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIntegratedOffenderManagement({
      requestBody,
      recommendationId,
    })
    expect(valuesToSave).toEqual({
      isUnderIntegratedOffenderManagement: {
        allOptions: formOptions.isUnderIntegratedOffenderManagement,
        selected: 'NO',
      },
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-custody')
  })

  it('returns valuesToSave and no errors if Not applicable selected', async () => {
    const requestBody = {
      isUnderIntegratedOffenderManagement: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIntegratedOffenderManagement({
      requestBody,
      recommendationId,
    })
    expect(valuesToSave).toEqual({
      isUnderIntegratedOffenderManagement: {
        allOptions: formOptions.isUnderIntegratedOffenderManagement,
        selected: 'NOT_APPLICABLE',
      },
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-custody')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isUnderIntegratedOffenderManagement: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIntegratedOffenderManagement({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isUnderIntegratedOffenderManagement',
        name: 'isUnderIntegratedOffenderManagement',
        text: 'You must select whether {{ fullName }} is under Integrated Offender Management',
        errorId: 'noIntegratedOffenderManagementSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isUnderIntegratedOffenderManagement: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIntegratedOffenderManagement({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isUnderIntegratedOffenderManagement',
        name: 'isUnderIntegratedOffenderManagement',
        text: 'You must select whether {{ fullName }} is under Integrated Offender Management',
        errorId: 'noIntegratedOffenderManagementSelected',
      },
    ])
  })
})
