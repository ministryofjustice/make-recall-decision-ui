import { validateLocalPoliceContactDetails } from './formValidator'

describe('validateLocalPoliceContactDetails', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      contactName: 'Thomas Magnum',
      phoneNumber: '07337838282',
      faxNumber: '02075289289',
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
    expect(nextPagePath).toEqual('/recommendations/34/victim-contact-scheme')
  })

  it('returns errors for missing fields, and no valuesToSave', async () => {
    const requestBody = {}
    const { errors, valuesToSave } = await validateLocalPoliceContactDetails({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noLocalPoliceName',
        href: '#contactName',
        name: 'contactName',
        text: 'Enter a police contact name',
      },
      {
        errorId: 'noLocalPolicePhone',
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a phone number',
      },
      {
        errorId: 'noLocalPoliceFax',
        href: '#faxNumber',
        name: 'faxNumber',
        text: 'Enter a fax number',
      },
      {
        errorId: 'noLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter an email address',
      },
    ])
  })

  it('returns unsaved values if there are errors', async () => {
    const requestBody = {
      contactName: 'Thomas Magnum',
      phoneNumber: '07337838282',
    }
    const { errors, unsavedValues, valuesToSave } = await validateLocalPoliceContactDetails({
      requestBody,
      recommendationId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noLocalPoliceFax',
        href: '#faxNumber',
        name: 'faxNumber',
        text: 'Enter a fax number',
      },
      {
        errorId: 'noLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter an email address',
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
        errorId: 'invalidLocalPolicePhone',
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a valid phone number',
      },
      {
        errorId: 'invalidLocalPoliceFax',
        href: '#faxNumber',
        name: 'faxNumber',
        text: 'Enter a valid fax number',
      },
      {
        errorId: 'invalidLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter a valid email address',
      },
    ])
    expect(unsavedValues).toEqual(requestBody)
  })
})
