import { validateLocalPoliceContactDetails } from './formValidator'

describe('validateLocalPoliceContactDetails', () => {
  const recommendationId = '34'
  it('returns valuesToSave with HTML tags stripped, and no errors if valid', async () => {
    const requestBody = {
      contactName: 'Thomas Magnum',
      phoneNumber: '+44 808 157 0192',
      faxNumber: '0207 528 9289',
      emailAddress: 'thomas.magnum@gmail.com',
    }
    const { errors, valuesToSave, nextPagePath } = await validateLocalPoliceContactDetails({
      requestBody,
      recommendationId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      localPoliceContact: requestBody,
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-custody')
  })

  it('returns errors for missing name, and no valuesToSave', async () => {
    const requestBody = {
      contactName: ' ',
    }
    const { errors, valuesToSave } = await validateLocalPoliceContactDetails({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noLocalPoliceName',
        href: '#contactName',
        name: 'contactName',
        text: 'Enter the police contact name',
      },
    ])
  })

  it('returns unsaved values if there are errors', async () => {
    const requestBody = {
      contactName: 'Thomas Magnum',
      phoneNumber: '00442082922943',
      emailAddress: 'test.com',
    }
    const { errors, unsavedValues, valuesToSave } = await validateLocalPoliceContactDetails({
      requestBody,
      recommendationId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'invalidLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter an email address in the correct format, like name@example.com',
      },
    ])
    expect(unsavedValues).toEqual(requestBody)
  })

  it('returns errors and unsaved values for invalid fields', async () => {
    const requestBody = {
      contactName: 'Thomas Magnum',
      phoneNumber: '123',
      faxNumber: '345',
      emailAddress: 'nope',
    }
    const { errors, unsavedValues, valuesToSave } = await validateLocalPoliceContactDetails({
      requestBody,
      recommendationId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'invalidPhoneNumber',
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a telephone number, like 01277 960 001, 07364 900 982 or +44 808 157 0192',
      },
      {
        errorId: 'invalidLocalPoliceFax',
        href: '#faxNumber',
        name: 'faxNumber',
        text: 'Enter a fax number, like 01277 960 001, 07364 900 982 or +44 808 157 0192',
      },
      {
        errorId: 'invalidLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter an email address in the correct format, like name@example.com',
      },
    ])
    expect(unsavedValues).toEqual(requestBody)
  })
})
